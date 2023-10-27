import csv
import json


class Employee:
    def __init__(self, name: str, department: str, salary: int, office: str, isManager: bool, skills: list[str]):
        self.name = name
        self.department = department
        self.salary = salary
        self.office = office
        self.isManager = isManager
        self.skills = skills

    def add_skill(self, skill: str):
        self.skills.append(skill)

    def to_json(self):
        skills = ""
        for skill in self.skills:
            skills += f'"{skill}", '

        return f'{{ ' \
               f'"name": "{self.name}", ' \
               f'"department": "{self.department}", ' \
               f'"salary": {self.salary}, ' \
               f'"office": "{self.office}", ' \
               f'"isManager": {str(self.isManager).lower()}, ' \
               f'"skills": [{skills[:-2]}]' \
               f' }}'


class Department:
    def __init__(self, name: str = ""):
        self.name = name
        self.managerName = ""
        self.employees = []

    def set_manager(self, managerName: str):
        self.managerName = managerName

    def add_employee(self, employee: Employee):
        self.employees.append(employee)

    def to_json(self):
        return f'{{ ' \
               f'"name": "{self.name}", ' \
               f'"managerName": "{self.managerName}", ' \
               f'"employees": [{", ".join([e.to_json() for e in self.employees])}]' \
               f' }}'


class Organization:
    def __init__(self):
        self.departments = {}

    def add_employee(self, employee: Employee):
        department_name = employee.department
        if department_name not in self.departments:
            self.departments[department_name] = Department(department_name)
        self.departments[department_name].add_employee(employee)
        if employee.isManager:
            self.departments[department_name].set_manager(employee.name)

    def to_json(self):
        return f'{{ ' \
               f'"organization": ' \
               f'{{ "departments": [{", ".join([d.to_json() for d in self.departments.values()])}] }}' \
               f' }}'


class OrgJsonConvert:
    # input and output files
    csv_path = "data/org_csv_databases/general_data.csv"
    json_path = "data/org_json_graphs/general_data.json"

    # store data from CSV file as Organization object
    org = Organization()

    # read in CSV
    with open(csv_path) as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            salary = int(row["salary"])
            isManager = row["isManager"] == "TRUE"
            employee = Employee(row["name"], row["department"], salary, row["office"], isManager, [row["skill1"], row["skill2"], row["skill3"]])
            org.add_employee(employee)

    # write to JSON and reformat
    with open(json_path, 'w') as json_file:
        json_file.write(org.to_json())

    # with open(json_path, 'r') as json_file:
    #     json_data = json.load(json_file)
    #     print(f'json_data type: {type(json_data)}')
    #
    # with open(json_path, 'w') as json_file:
    #     json.dump(json_data, json_file, indent=4)

    print(f'CSV file "{csv_path}" has been converted to JSON file "{json_path}"')