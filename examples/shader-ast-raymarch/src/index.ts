import { swizzle8 } from "@thi.ng/binary";
import { rgbaInt } from "@thi.ng/color";
import {
    $,
    $x,
    add,
    assign,
    clamp01,
    defn,
    diffuseLighting,
    fit1101,
    float,
    fogExp2,
    gte,
    ifThen,
    lambert,
    lookat,
    mix,
    mul,
    program,
    raymarchAO,
    raymarchDir,
    raymarchNormal,
    raymarchScene,
    ret,
    sdAABB,
    sdOpSmoothUnion,
    sdSphere,
    sdTxRepeat3,
    Sym,
    sym,
    targetGLSL,
    targetJS,
    TRUE,
    vec2,
    vec3,
    vec4
} from "@thi.ng/shader-ast";
import {
    compileModel,
    draw,
    GLSL,
    GLVec3,
    quad,
    shader
} from "@thi.ng/webgl";

// set URL hash to "#2d" to enable JS Canvas2D version
const JS_MODE = location.hash.indexOf("2d") >= 0;

// AST compile targets
const GL = targetGLSL(300); // WebGL2
const JS = targetJS();

// scene definition for raymarch function. uses SDF primitive functions
// included in "standard library" bundled with shader-ast pkg
const scene = defn("vec2", "scene", [["vec3"]], (pos) => {
    let d1: Sym<"f32">;
    let d2: Sym<"f32">;
    let d3: Sym<"f32">;
    let d4: Sym<"f32">;
    return [
        assign(pos, sdTxRepeat3(pos, vec3(2.1))),
        (d1 = sym(sdSphere(pos, float(0.5)))),
        (d2 = sym(sdAABB(pos, vec3(1, 0.2, 0.2)))),
        (d3 = sym(sdAABB(pos, vec3(0.2, 0.2, 1)))),
        (d4 = sym(sdAABB(pos, vec3(0.2, 1, 0.2)))),
        ret(
            vec2(
                sdOpSmoothUnion(
                    sdOpSmoothUnion(
                        sdOpSmoothUnion(d1, d2, float(0.2)),
                        d3,
                        float(0.2)
                    ),
                    d4,
                    float(0.2)
                ),
                1
            )
        )
    ];
});

// main fragment shader function
// again uses several shader-ast std lib helpers
const main = defn(
    "vec4",
    "mainImage",
    [
        ["vec2", "fragCoord"],
        ["vec2", "res"],
        ["vec3", "eyePos"],
        ["vec3", "lightDir"]
    ],
    (frag, res, eyePos, lightDir) => {
        let dir: Sym<"vec3">;
        let result: Sym<"vec2">;
        let isec: Sym<"vec3">;
        let norm: Sym<"vec3">;
        let material: Sym<"vec3">;
        let diffuse: Sym<"f32">;
        // background color
        let bg = vec3(1.5, 0.6, 0);
        return [
            // compute ray dir from fragCoord, viewport res and FOV
            // then apply basic camera settings (eye, target, up)
            (dir = sym(
                $(
                    mul(
                        lookat(eyePos, vec3(), vec3(0, 1, 0)),
                        vec4(raymarchDir(frag, res, float(120)), 0)
                    ),
                    "xyz"
                )
            )),
            // perform raymarch
            (result = sym(
                // `raymarchScene` is a higher-order, configurable function which constructs
                // a raymarch function using our supplied scene fn
                raymarchScene(scene, { steps: JS_MODE ? 60 : 60, eps: 0.005 })(
                    eyePos,
                    dir
                )
            )),
            // early bailout if nothing hit
            ifThen(gte($x(result), float(10)), [ret(vec4(bg, 1))]),
            // set intersection pos
            (isec = sym(add(eyePos, mul(dir, $x(result))))),
            // surface normal
            (norm = sym(
                // higher-order fn to compute surface normal
                raymarchNormal(scene)(isec, float(0.01))
            )),
            // set material color
            (material = sym(fit1101(isec))),
            // compute diffuse term
            (diffuse = sym(
                mul(
                    lambert(norm, lightDir, TRUE),
                    // higher order fn to compute ambient occlusion
                    raymarchAO(scene)(isec, norm)
                )
            )),
            // combine lighting & material colors
            ret(
                vec4(
                    mix(
                        clamp01(
                            diffuseLighting(
                                diffuse,
                                material,
                                vec3(1),
                                vec3(0.2)
                            )
                        ),
                        bg,
                        fogExp2($x(result), float(0.2))
                    ),
                    1
                )
            )
        ];
    }
);

// actual GLSL fragment shader main function
const glslMain = defn("void", "main", [], () => [
    assign(
        sym("vec4", "o_fragColor"),
        main(
            $(GL.gl_FragCoord, "xy"),
            sym("vec2", "u_resolution"),
            sym("vec3", "u_eyePos"),
            sym("vec3", "u_lightDir")
        )
    )
]);

// build call graph for given entry function, sort in topological order
// and bundle all functions in a global scope for code generation...
const shaderProgram = program(main);

console.log("JS");
console.log(JS(shaderProgram));
console.log("GLSL");
console.log(GL(shaderProgram));

const W = 320;
const H = 240;
const size = [W, H];
const canvas = document.createElement("canvas");
canvas.width = W;
canvas.height = H;
document.body.appendChild(canvas);
const info = document.createElement("div");
info.innerText = (JS_MODE ? "Canvas2D" : "WebGL2") + " version";
document.body.appendChild(info);

const lightDir = [0.707, 0.707, 0];

if (JS_MODE) {
    //
    // JS Canvas 2D shader emulation from here...
    //
    const fn = JS.compile(shaderProgram).mainImage;

    const ctx = canvas.getContext("2d")!;
    const img = ctx.getImageData(0, 0, W, H);
    const u32 = new Uint32Array(img.data.buffer);
    let time = 0;

    setInterval(() => {
        time += 0.1;
        const frag = [];
        const eyePos = [
            Math.cos(time) * 2.5,
            Math.cos(time / 2) * 0.7,
            Math.sin(time) * 2.5
        ];
        for (let y = 0, H1 = H - 1, i = 0; y < H; y++) {
            frag[1] = H1 - y;
            for (let x = 0; x < W; x++) {
                frag[0] = x;
                u32[i++] = swizzle8(
                    rgbaInt(fn(frag, size, eyePos, lightDir)),
                    0,
                    3,
                    2,
                    1
                );
            }
        }
        ctx.putImageData(img, 0, 0);
    }, 16);
} else {
    //
    // WebGL mode...
    //
    // inject main fs function into AST program
    shaderProgram.body.push(glslMain);
    const ctx: WebGL2RenderingContext = canvas.getContext("webgl2")!;
    // build fullscreen quad
    const model = quad(false);
    // set shader
    model.shader = shader(ctx, {
        vs: GL(
            defn("void", "main", [], () => [
                assign(GL.gl_Position, vec4(sym("vec2", "a_position"), 0, 1))
            ])
        ),
        fs: GL(shaderProgram).replace(/\};/g, "}"),
        attribs: {
            position: GLSL.vec2
        },
        uniforms: {
            eyePos: GLSL.vec3,
            lightDir: [GLSL.vec3, <GLVec3>lightDir],
            resolution: [GLSL.vec2, [W, H]]
        }
    });
    // compile model (attrib buffers)
    compileModel(ctx, model);

    const t0 = Date.now();
    // render loop
    setInterval(() => {
        const time = (Date.now() - t0) * 0.001;
        model.uniforms!.eyePos = [
            Math.cos(time) * 2.5,
            Math.cos(time / 2) * 0.7,
            Math.sin(time) * 2.5
        ];
        draw(model);
    });
}
