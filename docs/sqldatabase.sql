CREATE TABLE users_data(
	id INT NOT NULL PRIMARY KEY,
	name VARCHAR(30) NOT NULL , 
	email VARCHAR(100) NOT NULL , 
	password VARCHAR(30) NOT NULL
);

CREATE TABLE container(
	id_container SERIAL PRIMARY KEY,
	name VARCHAR(30),
	user_id INT,
	FOREIGN KEY(user_id) REFERENCES users_data(id)
);

	
CREATE TABLE tasks (
	id_task SERIAL PRIMARY KEY,
	task_name VARCHAR(30),
	status BIT,
	container INT,
	user_id INT,
	description VARCHAR(200),
	FOREIGN KEY(user_id) REFERENCES users_data(id),
	FOREIGN KEY(container) REFERENCES container(id_container)
);

