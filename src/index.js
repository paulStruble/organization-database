class Employee {
	constructor(name, department, salary, office, isManager, skills) {
		this.name = name;
		this.department = department;
		this.salary = salary;
		this.office = office;
		this.isManager = isManager;
		this.skills = skills;
	}

	toJson() {
		return `{"name":"${this.name}","department":"${this.department}","salary":${this.salary},"office":"${this.office}","isManager":${String(this.isManager)},"skills":["${this.skills[0]}", "${this.skills[1]}", "${this.skills[2]}"]}`
	}
}


class Department {
	constructor(name = "") {
		this.name = name;
		this.managerName = "";
		this.employees = [];
	}

	setManager(managerName) {
		this.managerName = managerName;
	}

	addEmployee(employee) {
		this.employees.push(employee);
	}

	toJson() {
		return `{"name":"${this.name}","managerName":"${this.managerName}","employees":[${this.employees.map((e) => e.toJson()).join(", ")}]}`
	}
}


class Organization {
	constructor() {
		this.departments = new Map();
	}

	addEmployee(employee) {
		const department_name = employee.department;
		if (!this.departments.has(department_name)) {
			this.departments.set(department_name, new Department(department_name));
		}
		this.departments.get(department_name).addEmployee(employee);
		if (employee.isManager) {
			this.departments.get(department_name).setManager(employee.name)
		}
	}

	toJson() {
		return `{"organization":{"departments":[${Array.from(this.departments.values()).map((d) => d.toJson()).join(", ")}]}}`
	}
}


export default {
	async fetch(request, env, ctx) {
		// handle all GET requests
		if (request.method === "GET") {
			// organization-chart endpoint
			if (request.url.match(/\/organization-chart\/*$/)) {
				const org_data = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
				const json = JSON.stringify(org_data, null, 4);
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
				for (let row_index = 1; row_index < rows.length - 1; row_index++) {
					const row = rows[row_index].split(","); // split row into array of cells
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

				// for debugging
				// await env.KV_ORG_DB.put("request_" + Date.now(), body);

				const orgData = await env.KV_ORG_DB.get("org_json_default", { type: "json" });
				let employee_matches = [];

				// find all employees matching the query - iterate through all employees in organization
				const departments = orgData.organization.departments;
				for (const department in departments) {
					for (const employee in department.employees) {
						employee_matches.push(employee); // add employee to matches by default, remove if not a match

						// check for mismatch attributes between query and employee
						for (const attribute in query) {
							// check skills separately since they are stored in an array
							if (attribute === "skill") {
								if (employee.skills.indexOf(query[attribute] === -1)) {
									employee_matches.pop();
									break;
								}
							} else if (query[attribute] !== employee[attribute]) {
								employee_matches.pop();
								break;
							}
						}
					}
				}

				const jsonMatches = `{ "employees": ${JSON.stringify(employee_matches)}}`;
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
