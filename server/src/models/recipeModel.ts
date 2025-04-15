import { type Document, model, Schema } from 'mongoose'

// Define the recipe schema
interface IRecipe extends Document {
  name: string;
  ingredients: {
    name: string;
    quantity: string;
    walmartProductId?: string; // Optional
  }[];
  instructions: string;
  createdBy: string;
  dateCreated: Date;
}

const recipeSchema = new Schema<IRecipe>({ // Structure seen in mongosh
  name: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      name: { 
        type: String,
        required: [true, 'Ingredient name is required']
      },
      quantity: {
        type: String,
        required: [true, 'Quantity is required']
      },
      walmartProductId: {
        type: String,
        required: false, // Optional
      }
    }
  ],
  instructions: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true })

// Create the model
const Recipe = model<IRecipe>('Recipe', recipeSchema)

export default Recipe
