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

export default Employee;