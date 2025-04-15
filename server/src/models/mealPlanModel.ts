import { type Document, model, Schema } from 'mongoose';

// Define the meal plan schema
interface IMealPlan extends Document {
  title: string;
  recipeIds: string[]; // Array of recipe IDs
  createdBy: string;
  dateCreated: Date;
}

const mealPlanSchema = new Schema<IMealPlan>({
  title: {
    type: String,
    required: true,
  },
  recipeIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    }
  ],
  createdBy: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

export default model<IMealPlan>('MealPlan', mealPlanSchema);
