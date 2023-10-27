export default {
	async fetch(request, env, ctx) {
		// handle all GET requests
		if (request.method === "GET") {
			// organization-chart endpoint
			if (request.url.endsWith("/organization-chart")) {
				const org_data = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
				const json = JSON.stringify(org_data, null, 4);
				return new Response(json, {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}

			// me endpoint
			else if (request.url.endsWith("/me")) {
				const data = await env.KV_ORG_DB.get("me_json", { type: "json" });
				const json = JSON.stringify(data, null, 4);
				return new Response(json, {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}
		}


		// handle all POST requests
		// else if (request.method === "POST") {
		// 	// organization-chart endpoint
		// 	if (request.url.endsWith("organization-chart")) {
		// 		fetch("https://organization-database.paul-struble.workers.dev/OrgCsvToJson", {
		// 			method: 'POST',
		// 			body: request.body, // Your CSV data here
		// 		})
		// 			.then((response) => response.json())
		// 			.then((json) => {
		// 				return new Response(json, {
		// 					headers: {
		// 						"content-type": "application/json;charset=UTF-8",
		// 					},
		// 				});
		// 			})
		// 	}
		// }


		// resource not found response
		return new Response("Resource not found", {
			status: 404,
			statusText: "Not Found",
			headers: { "Content-Type": "text/plain" },
		});
	},
};
