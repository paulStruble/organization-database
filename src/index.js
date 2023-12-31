import Employee from './org-classes/Employee.js';
import Organization from './org-classes/Organization.js';


export default {
	async fetch(request, env, ctx) {
		// handle all GET requests
		if (request.method === "GET") {
			// organization-chart endpoint
			if (request.url.match(/\/organization-chart\/*$/)) {
				const orgData = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
				const json = JSON.stringify(orgData, null, 4);
				return new Response(json, {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}

			// me endpoint
			else if (request.url.match(/\/me\/*$/)) {
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
		else if (request.method === "POST") {
			// organization-chart endpoint
			if (request.url.match(/\/organization-chart\/*$/)) {
				// extract csv from request
				const body = await request.text();
				const orgData = JSON.parse(body).organizationData;

				// Organization object to construct from csv
				let org = new Organization();

				// parse organization data from csv
				const rows = orgData.split("\r\n");
				for (let rowIndex = 1; rowIndex < rows.length - 1; rowIndex++) {
					const row = rows[rowIndex].split(","); // split row into array of cells
					if (row) {
						const salary = Number(row[2]); // parse number from salary string
						const isManager = row[4] === "TRUE"; // parse boolean from isManager string

						//construct employee from row data
						const employee = new Employee(row[0], row[1], salary, row[3], isManager, [row[5], row[6], row[7]]);
						org.addEmployee(employee);
					}
				}

				const orgChartJson = JSON.stringify(JSON.parse(org.toJson()), null, 4);
				return new Response(orgChartJson, {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}

			// employee endpoint
			else if (request.url.match(/\/employee\/*$/)) {
				const body = await request.text();
				const query = JSON.parse(body);

				const orgData = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
				let employeeMatches = [];

				// find all employees matching the query - iterate through all employees in organization
				const departments = orgData.organization.departments;
				for (const department of departments) {
					for (const employee of department.employees) {
						employeeMatches.push(employee); // add employee to matches by default, remove if not a match

						// check for mismatch attributes between query and employee
						for (const attribute in query) {
							// check skills separately since they are stored in an array
							if (attribute === "skill") {
								if (employee.skills.indexOf(query[attribute] === -1)) {
									employeeMatches.pop();
									break;
								}
							} else if (query[attribute] !== employee[attribute]) {
								employeeMatches.pop();
								break;
							}
						}
					}
				}

				const jsonMatches = `{ "employees": ${JSON.stringify(employeeMatches)}}`;
				return new Response(jsonMatches, {
					headers: {
						"content-type": "application/json;charset=UTF-8",
					},
				});
			}
		}


		// resource not found response
		return new Response("Resource not found", {
			status: 404,
			statusText: "Not Found",
			headers: { "Content-Type": "text/plain" },
		});
	},
};
