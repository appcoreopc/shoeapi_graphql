import { Db } from "mongodb";

class Product { 

  private _db : Db;
  
  constructor(db: Db) {
      this._db = db;
  }

  GetProductAll = async() => {
       
    let collection = this._db.collection('product');
    return collection.find({});
  }

}

export default Product;

