SQL project

POST
Register
localhost:3010/register
Register User
This endpoint allows you to register a new user.

Request Body
name (string, required): The name of the user.
email (string, required): The email of the user.
password (string, required): The password for the user.
id (string, required): The unique identifier for the user.
Response
Upon successful registration, the server responds with a status code of 200 and a content type of text/html. The response body contains the details of the newly created user, including their name, email, and unique identifier.

Example response:

Plain Text
Usuario creado: Nombre Juan, Email: Juan@gmail.com, Id: 123987

Body
raw (json)
json
{
    "name":"Juan",
    "email":"Juan@gmail.com",
    "password":"1234535",
    "id":"32489239"
}
POST
Login
localhost:3010/login
Login Endpoint
This endpoint is used to authenticate and login the user.

Request Body
id (number) - The user ID.
password (string) - The user's password.
Response
Upon successful authentication, the server responds with a status code of 200 and a content type of text/html, along with the message "sesion iniciada" indicating that the session has been successfully initiated.


Body
raw (json)
json
{
    "id": 12345,
    "password":"1234578"
}
POST
Post/update/delete tasks/Containers
localhost:3010/tasks
POST /tasks
This endpoint is used to create a new task.

Request Body
type (string, required): The type of the task.
name (string, required): The name of the task.
id_container (string, required): The ID of the container for the task.
id (string, required): The ID of the task.
procedure (string, required): The procedure for the task.
description (string, required): The description of the task.
status (integer, required): The status of the task.
Response
The response for this request is in XML format.

JSON Schema
JSON
{
    "type": "object",
    "properties": {
        "responseProperty1": {
            "type": "string"
        },
        "responseProperty2": {
            "type": "integer"
        }
    }
}


Body
raw (json)
json
{
    "type":"task",
    "name":"Tarea 1",
    "id_container": "5",
    "id":"3",
    "procedure":"update",
    "description":"hola",
    "status":1
}
GET
Get tasks
localhost:3010/tasks
GET /tasks
This endpoint retrieves a list of tasks.

Request
There are no request parameters for this endpoint.

Response
The response will be a JSON array containing task objects with the following properties:

id_task (number): The ID of the task.
task_name (string): The name of the task.
status (string): The status of the task.
container (number): The container ID associated with the task.
user_id (number): The ID of the user associated with the task.
description (string): The description of the task.
id_container (number): The ID of the container associated with the task.
name (string): The name associated with the task.
Example response:

JSON
[
    {
        "id_task": 0,
        "task_name": "",
        "status": "",
        "container": 0,
        "user_id": 0,
        "description": null,
        "id_container": 0,
        "name": ""
    }
]


