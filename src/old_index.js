export default {
	async fetch(request, env, ctx) {
		// extract path from url
		const url = request.url;
		const pathRegex = /^https?:\/\/[^/]+(\/[^?#]*)/;
		const path = url.match(pathRegex)[1].slice(1);


		// organization-chart endpoint
		// respond with default json organization from KV
		if (path.match(/organization-chart\/?/)) {
			const org_data = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
			const json = JSON.stringify(org_data, null, 4);
			return new Response(json, {
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});

			// me endpoint
			// respond with me json from KV
		} else if (path.match(/me\/?/)) {
			const data = await env.KV_ORG_DB.get("me_json", { type: "json" });
			const json = JSON.stringify(data, null, 4);
			return new Response(json, {
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		}

		// default response: current path
		return new Response(`Path: ${path}`);
	},
};
