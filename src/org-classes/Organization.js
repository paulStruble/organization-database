import Department from './Department';

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

export default Organization;