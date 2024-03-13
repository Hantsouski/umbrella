import type { Fn } from "@thi.ng/api";
import { equiv } from "@thi.ng/equiv";
import type { HTMLRouterOpts } from "./api.js";
import { Router } from "./router.js";

export class HTMLRouter<T = any> extends Router<T> {
	protected currentPath!: string;
	protected popHandler!: Fn<PopStateEvent, void>;
	protected hashHandler!: EventListener;
	protected useFragment: boolean;
	protected ignoreHashChange: boolean;

	constructor(config: HTMLRouterOpts) {
		super({ prefix: config.useFragment ? "#/" : "/", ...config });
		this.useFragment = config.useFragment !== false;
		this.ignoreHashChange = false;
	}

	start() {
		window.addEventListener("popstate", this.handlePopChange());
		if (this.useFragment) {
			window.addEventListener("hashchange", this.handleHashChange());
		}
		if (this.opts.initial) {
			const route = this.routeForID(this.opts.initial)!;
			this.route(this.format({ id: route.id }));
		} else {
			this.route(this.useFragment ? location.hash : location.pathname);
		}
	}

	release() {
		window.removeEventListener("popstate", this.popHandler);
		if (this.useFragment) {
			window.removeEventListener("hashchange", this.hashHandler);
		}
	}

	/**
	 * Like {@link Router.route}, but takes additional arg to control if
	 * this routing operation should manipulate the browser's `history`.
	 *
	 * @remarks
	 * If called from userland, this normally is true (also default). However,
	 * we want to avoid this if called from this router's own event handlers.
	 *
	 * @param src -
	 * @param ctx -
	 * @param pushState -
	 */
	route(src: string, ctx?: T, pushState = true) {
		const old = this.current;
		const route = super.route(src, ctx);
		if (route && !equiv(route, old)) {
			this.currentPath = this.format(route);
			if (pushState) {
				history.pushState(this.currentPath, "", this.currentPath);
			}
		}
		return route;
	}

	routeTo(route: string, ctx?: T) {
		if (this.useFragment) {
			location.hash = route;
		}
		this.route(route, ctx);
	}

	protected handlePopChange() {
		return (this.popHandler =
			this.popHandler ||
			((e: PopStateEvent) => {
				this.route(
					e.state ||
						(this.useFragment ? location.hash : location.pathname),
					undefined,
					false
				);
			}).bind(this));
	}

	protected handleHashChange() {
		return (this.hashHandler =
			this.hashHandler ||
			((e: HashChangeEvent) => {
				if (!this.ignoreHashChange) {
					const hash = e.newURL.substring(e.newURL.indexOf("#"));
					if (hash !== this.currentPath) {
						this.route(hash, undefined, false);
					}
				}
			}).bind(this));
	}

	protected handleRouteFailure() {
		this.ignoreHashChange = true;
		location.hash = this.format({
			id: this.routeForID(this.opts.default)!.id,
		});
		this.ignoreHashChange = false;
		return true;
	}
}
