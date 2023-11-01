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
				const orgData = body.substring(24, body.length - 3);

				// Organization object to construct from csv
				let org = new Organization();

				const rows = orgData.split("\n");
				for (let row_index = 1; row_index < rows.length; row_index++) {
					const row = rows[row_index].split(",");
					const salary = Number(row[2]);
					const isManager = row[4] === "TRUE";
					let skill3 = row[7];
					skill3 = skill3.substring(0, skill3.length - 1);
					const employee = new Employee(row[0], row[1], salary, row[3], isManager, [row[5], row[6], skill3]);
					org.addEmployee(employee);
				}

				//return new Response(org.toJson());
				//return new Response(JSON.parse(org.toJson()));
				const orgChartJson = JSON.stringify(JSON.parse(org.toJson()), null, 4);
				return new Response(orgChartJson, {
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
