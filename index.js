
const Product = require('./dataAccess/product');
const { PubSub, ApolloServer, gql } = require('apollo-server');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'apptest';
//const client = new MongoClient(url, { useNewUrlParser : true });

// A schema is a collection of type definitions (hence "typeDefs") 
// that together define the "shape" of queries that are executed against 
// your data.

const dStore =  null;

async function connect() {

  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  
  if (!client) {
    console.log('error ')
    return;
  }

  console.log('successfully connected')
  return client.db(dbName);
}

const typeDefs = gql`

type Shoe {

  sku : String 
  name : String
  manufacturer: String
  producttype : String 
  price : Float
  
}

type User { 
  id : String 
  firstname : String 
  lastname : String 
  username : String 
  cartid : String
}


type Carttem { 
  id : String 
  firstname : String 
  lastname : String 
  username : String 
  cartid : String
}

type Subscription {
  cartItemUpdate : Cart
}

type Cart { 
  
  id : String
  item : String
}

type Mutation {
  
  updateUserAge(id: Int!, age: Int!): User
  
}  

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).

type Query {
  shoes: [Shoe]
  user : [User]
  db : [Shoe]
}

`;

const POST_ADDED = 'POST_ADDED';

const shoesData = [
  {
    name: 'Nike X',
    manufacturer: 'Nike',
  },
  {
    name: 'Air Jordan',
    manufacturer: 'Nike',
    
  },
  {
    name: 'Air Max',
    manufacturer: 'Nike',
  },
];

function getUsers() {
  
  const usersData = [
    {
      firstname: 'Jeremy',
      lastname: 'Woo',
    },
    {
      firstname: 'Mark',
      lastname: 'Lee',
    },
    {
      firstname: 'Jessica',
      lastname: 'Simpson',
    },
  ];
  
  return usersData;
  
}


function getExtraUser() {
  
  const usersData = [
    {
      firstname: 'Jeremy1',
      lastname: 'Woo1',
    },
    {
      firstname: 'Mark2',
      lastname: 'Lee2',
    },
    {
      firstname: 'Jessica2',
      lastname: 'Simpson2',
    },
  ];
  
  return usersData;
  
}

const pubsub = new PubSub();

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {

  Query: {
    shoes: () => shoesData,
    user : () => getUsers(), 

    db :  async (_source, _args, { dataSources }) => { 

      let db = await connect();
      let collection = db.collection('product');
      let data = await collection.find({'id': '1'}).toArray();

      return data;

       
      //return dataSources.db;
    }  
  },
  
  Subscription : { 
    cartItemUpdate : {
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    }
  },
  
  Mutation: { 

    updateUserAge : (id, age) => {
      
      pubsub.publish(POST_ADDED, 
        
        { cartItemUpdate : 
          {  
            id: 100,
            item : 'first reebok pump shoe'
          }        
        });
        
        return {
          firstname: 'Nike X',
          lastname: 'Nike',
        }
      }      
    }
    
  };
  
    
  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer(
    { 
      typeDefs, 
      resolvers, 
      dataSources: () => {
             
        return {

          db : getExtraUser()
      
      };
    },
      context : () => {

            return {

            }
          }
   });
  
  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
  
  
//   mutation {
//     updateUserAge(id: 1, age : 10) {
//        id
//        firstname
//     }
//   }
  
//  subscription {
//    cartItemUpdate  {
//      id
    
//      item {
//        name
//     } 
//   }
//  }
 

//  docker run -d -p 27017:27107 -v ~/data:/data/db mongo

 