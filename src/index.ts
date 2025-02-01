import path from 'path';
import * as grpc from '@grpc/grpc-js';
import  { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js"
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../src/a.proto'));

const personProto = grpc.loadPackageDefinition(packageDefinition);

const PERSONS = [
    {
        name: "harkirat",
        age: 45
    },
    {
      name: "raman",
      age: 45
    },
];

//@ts-ignore
function addPerson(call, callback) {
  console.log(call)
    let person = {
      name: call.request.name,
      age: call.request.age
    }
    PERSONS.push(person);
    callback(null, person)
}

//@ts-ignore
function getPersonByName(call, callback) {
    try {
        const name = call.request.name; // Extract name from the request
    
        // Find the person by name
        const person = PERSONS.find((p) => p.name === name);
    
        if (person) {
          callback(null, person); // Return the found person
        } else {
          // If no person is found, return a NOT_FOUND error
          callback({
            code: grpc.status.NOT_FOUND,
            message: `Person with name '${name}' not found`,
          });
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Error in GetPersonByName:', error);
        callback({
          code: grpc.status.INTERNAL,
          message: 'An internal server error occurred',
        });
      }
  }

const server = new grpc.Server();

server.addService((personProto.AddressBookService as ServiceClientConstructor).service, 
{ 
    addPerson: addPerson,
    getPersonByName: getPersonByName 
 });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});