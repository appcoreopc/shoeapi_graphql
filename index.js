const { PubSub, ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs") 
// that together define the "shape" of queries that are executed against 
// your data.
const typeDefs = gql`
# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.


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
      firstname: 'Nike X',
      lastname: 'Nike',
    },
    {
      firstname: 'Air Jordan',
      lastname: 'Nike',
    },
    {
      firstname: 'Air Max',
      lastname: 'Nike',
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
    user : () => getUsers()
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
  const server = new ApolloServer({ typeDefs, resolvers });
  
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
 

 