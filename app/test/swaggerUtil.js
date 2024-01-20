function generateObject(propertySchema) {
    if (!propertySchema || propertySchema.type !== 'object') {
        throw new Error('Invalid or missing object schema');
    }

    const obj = {};

    if (propertySchema.properties) {
        for (const prop in propertySchema.properties) {
            if (propertySchema.properties.hasOwnProperty(prop)) {
                obj[prop] = generatePropertyValue(propertySchema.properties[prop]);
            }
        }
    }

    if (propertySchema.required) {
        for (const prop of propertySchema.required) {
            if (!obj.hasOwnProperty(prop)) {
                throw new Error(`Required property "${prop}" is missing`);
            }
        }
    }

    return obj;
}

function generateArray(arraySchema) {
    if (!arraySchema || arraySchema.type !== 'array' || !arraySchema.items) {
        throw new Error('Invalid or missing array schema');
    }

    const length = Math.floor(Math.random() * 1) + 1; // Generate an array with random length (1 to 5)

    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(generateObject(arraySchema.items));
    }

    return arr;
}

function generatePropertyValue(propertySchema) {
    if (!propertySchema) {
        throw new Error('Invalid or missing property schema');
    }

    if (propertySchema.type === 'integer' && propertySchema.format === 'int64') {
        return 0; // Replace with your logic for generating int64 values
    }

    if (propertySchema.type === 'string') {
        if (propertySchema.enum && Array.isArray(propertySchema.enum)) {
            return propertySchema.enum[Math.floor(Math.random() * propertySchema.enum.length)];
        }

        if (propertySchema.example) {
            return propertySchema.example;
        }

        return ''; // Replace with your logic for generating string values
    }

    if (propertySchema.type === 'object') {
        return generateObject(propertySchema);
    }

    if (propertySchema.type === 'array' && propertySchema.items) {
        if (propertySchema.items.type === 'array') {
            return generateArray(propertySchema.items);
        }else if (propertySchema.items.type === 'object') {
            return [generateObject(propertySchema.items)];
        }else {
            return [generatePropertyValue(propertySchema.items)];
        }
    }

    throw new Error(`Unsupported property type: ${propertySchema.type}`);
}

// Your given array schema
let arraySchema = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "name",
            "photoUrls"
        ],
        "properties": {
            "id": {
                "type": "integer",
                "format": "int64"
            },
            "category": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    }
                },
                "xml": {
                    "name": "Category"
                }
            },
            "name": {
                "type": "string",
                "example": "doggie"
            },
            "photoUrls": {
                "type": "array",
                "xml": {
                    "name": "photoUrl",
                    "wrapped": true
                },
                "items": {
                    "type": "string"
                }
            },
            "tags": {
                "type": "array",
                "xml": {
                    "name": "tag",
                    "wrapped": true
                },
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "integer",
                            "format": "int64"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "xml": {
                        "name": "Tag"
                    }
                }
            },
            "status": {
                "type": "string",
                "description": "pet status in the store",
                "enum": [
                    "available",
                    "pending",
                    "sold"
                ]
            }
        },
        "xml": {
            "name": "Pet"
        }
    }
};


function parseSchema(jsonSchema, type) {
    if (type === 'query') {
        jsonSchema = {
            type: 'object',
            properties: {
                username: {
                    "name": "username",
                    "in": "query",
                    "description": "The user name for login",
                    "required": true,
                    "type": "string"
                },
                password:{
                    "name": "password",
                    "in": "query",
                    "description": "The password for login in clear text",
                    "required": true,
                    "type": "string"
                }
            }
        }
    }else {

    }
}

arraySchema = {
    type: 'object',
    properties: {
        username: {
            "name": "username",
            "in": "query",
            "description": "The user name for login",
            "required": true,
            "type": "string"
        },
        password:{
    "name": "password",
    "in": "query",
    "description": "The password for login in clear text",
    "required": true,
    "type": "string"
}
    }
}

let generatedArray;
if (arraySchema.type === 'array') {
    generatedArray = generateArray(arraySchema);
}else {
    generatedArray = generateObject(arraySchema);
}
// Generate JSON array based on the schema


console.log(JSON.stringify(generatedArray, null, 2));
