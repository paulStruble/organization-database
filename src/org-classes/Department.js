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

export default Department;