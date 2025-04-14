import React from 'react'
import { useState } from 'react'
import { Dropdown, Nav, Navbar, Modal, Button, Form, Card, Alert, ListGroup, Row, Col } from 'react-bootstrap';

type Recipe = {
    id: string;
    name: string;
    image: string | null;
    servingSize: number;
    ingredients: string[];
    instructions: string;
    notes: string;
  };
  
  type MealPlan = {
    id: string;
    title: string;
    recipes: Recipe[];
  };
  
  type ViewType = 'recipe' | 'plan' | 'list' | 'recipe-detail' | 'plan-detail';
  
  const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => (
    <Card className="mb-3 h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      {recipe.image && (
        <Card.Img 
          variant="top" 
          src={recipe.image} 
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body>
        <Card.Title>{recipe.name}</Card.Title>
        <Card.Text className="text-muted">
          Serves: {recipe.servingSize}
        </Card.Text>
      </Card.Body>
    </Card>
  );
  
  const PlanCard = ({ plan, onClick }: { plan: MealPlan; onClick: () => void }) => (
    <Card className="mb-3 h-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Card.Body>
        <Card.Title>{plan.title}</Card.Title>
        <Card.Text className="text-muted">
          {plan.recipes.length} {plan.recipes.length === 1 ? 'recipe' : 'recipes'}
        </Card.Text>
        {plan.recipes.length > 0 && (
          <div className="mt-2">
            <h6 className="text-muted">Includes:</h6>
            <ul className="list-unstyled">
              {plan.recipes.slice(0, 3).map((recipe, index) => (
                <li key={index} className="text-truncate">
                  {recipe.name}
                </li>
              ))}
              {plan.recipes.length > 3 && (
                <li className="text-muted">+{plan.recipes.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card>
  );
  
  const RecipeDetailView = ({ 
    recipe, 
    onBack, 
    onEdit,
    onDelete
  }: { 
    recipe: Recipe; 
    onBack: () => void; 
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div className="card">
      <div className="card-body">
        <Button variant="outline-secondary" onClick={onBack} className="mb-3">
          ← Back to Recipes
        </Button>
        
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="img-fluid rounded mb-3"
            style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
          />
        )}
        
        <h2>{recipe.name}</h2>
        <p className="text-muted">Serves: {recipe.servingSize}</p>
        
        <div className="mb-4">
          <h4>Ingredients</h4>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-4">
          <h4>Instructions</h4>
          <p>{recipe.instructions}</p>
        </div>
        
        {recipe.notes && (
          <div className="mb-4">
            <h4>Notes</h4>
            <p>{recipe.notes}</p>
          </div>
        )}
        
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={onEdit}>
            Edit Recipe
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete Recipe
          </Button>
        </div>
      </div>
    </div>
  );
  
  const PlanDetailView = ({ 
    plan,
    recipes,
    onBack,
    onAddRecipe,
    onRemoveRecipe
  }: { 
    plan: MealPlan;
    recipes: Recipe[];
    onBack: () => void;
    onAddRecipe: (recipe: Recipe) => void;
    onRemoveRecipe: (recipeId: string) => void;
  }) => {
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  
    return (
      <div className="card">
        <div className="card-body">
          <Button variant="outline-secondary" onClick={onBack} className="mb-3">
            ← Back to Plans
          </Button>
          
          <h2>{plan.title}</h2>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Recipes in this plan</h4>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowAddRecipeModal(true)}
            >
              <img src={"./imgs/plus.png"} alt="Add Recipe" style={{ height: '20px', marginRight: '8px' }} />
              Add Recipe
            </Button>
          </div>
  
          <Row xs={1} md={2} lg={3} className="g-4">
            {plan.recipes.map(recipe => (
              <Col key={recipe.id}>
                <Card>
                  {recipe.image && (
                    <Card.Img 
                      variant="top" 
                      src={recipe.image} 
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{recipe.name}</Card.Title>
                    <Card.Text>Serves: {recipe.servingSize}</Card.Text>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecipe(recipe.id);
                      }}
                    >
                      Remove
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
  
          <Modal show={showAddRecipeModal} onHide={() => setShowAddRecipeModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Recipe to Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ListGroup>
                {recipes.filter(r => !plan.recipes.some(p => p.id === r.id)).map(recipe => (
                  <ListGroup.Item 
                    key={recipe.id} 
                    action 
                    onClick={() => {
                      onAddRecipe(recipe);
                      setShowAddRecipeModal(false);
                    }}
                  >
                    {recipe.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    );
  };
  
  const Main = () => {
    const [activeView, setActiveView] = useState<ViewType>('recipe');
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [plans, setPlans] = useState<MealPlan[]>([]);
    const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
    const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [newPlanTitle, setNewPlanTitle] = useState('');
    
    const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id'>>({
      name: '',
      image: null,
      servingSize: 1,
      ingredients: [''],
      instructions: '',
      notes: ''
    });
  
    const handleAddIngredient = () => {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, '']
      });
    };
  
    const handleIngredientChange = (index: number, value: string) => {
      const updatedIngredients = [...newRecipe.ingredients];
      updatedIngredients[index] = value;
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedIngredients
      });
    };
  
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewRecipe({
            ...newRecipe,
            image: reader.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const recipeToSave = {
        ...newRecipe,
        id: Date.now().toString()
      };
      
      if (editingRecipe) {
        setRecipes(recipes.map(r => r.id === editingRecipe.id ? recipeToSave : r));
      } else {
        setRecipes([...recipes, recipeToSave]);
      }
      
      setShowAddRecipeModal(false);
      setNewRecipe({
        name: '',
        image: null,
        servingSize: 1,
        ingredients: [''],
        instructions: '',
        notes: ''
      });
      setEditingRecipe(null);
    };
  
    const handleViewRecipe = (recipe: Recipe) => {
      setCurrentRecipe(recipe);
      setActiveView('recipe-detail');
    };
  
    const handleEditRecipe = (recipe: Recipe) => {
      setEditingRecipe(recipe);
      setNewRecipe({
        name: recipe.name,
        image: recipe.image,
        servingSize: recipe.servingSize,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        notes: recipe.notes
      });
      setActiveView('recipe');
      setShowAddRecipeModal(true);
    };
  
    const handleDeleteRecipe = () => {
      if (currentRecipe) {
        setRecipes(recipes.filter(r => r.id !== currentRecipe.id));
        setActiveView('recipe');
        setCurrentRecipe(null);
        setShowDeleteConfirm(false);
      }
    };
  
    const handleCreatePlan = () => {
      if (newPlanTitle.trim()) {
        const newPlan = {
          id: Date.now().toString(),
          title: newPlanTitle,
          recipes: []
        };
        setPlans([...plans, newPlan]);
        setNewPlanTitle('');
        setShowAddPlanModal(false);
      }
    };
  
    const handleViewPlan = (plan: MealPlan) => {
      setCurrentPlan(plan);
      setActiveView('plan-detail');
    };
  
    const handleAddRecipeToPlan = (recipe: Recipe) => {
      if (currentPlan) {
        const updatedPlan = {
          ...currentPlan,
          recipes: [...currentPlan.recipes, recipe]
        };
        setPlans(plans.map(p => p.id === currentPlan.id ? updatedPlan : p));
        setCurrentPlan(updatedPlan);
      }
    };
  
    const handleRemoveRecipeFromPlan = (recipeId: string) => {
      if (currentPlan) {
        const updatedPlan = {
          ...currentPlan,
          recipes: currentPlan.recipes.filter(r => r.id !== recipeId)
        };
        setPlans(plans.map(p => p.id === currentPlan.id ? updatedPlan : p));
        setCurrentPlan(updatedPlan);
      }
    };
  
    const renderView = () => {
      switch (activeView) {
        case 'recipe':
          return (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Recipes</h2>
                  <Button variant="outline-primary" onClick={() => setShowAddRecipeModal(true)}>
                    <img src={"./imgs/plus.png"} alt="Add Recipe" style={{ height: '20px', marginRight: '8px' }} />
                    Add Recipe
                  </Button>
                </div>
                
                <Row xs={1} md={2} lg={3} className="g-4">
                  {recipes.map(recipe => (
                    <Col key={recipe.id}>
                      <RecipeCard 
                        recipe={recipe} 
                        onClick={() => handleViewRecipe(recipe)} 
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          );
        case 'recipe-detail':
          return currentRecipe ? (
            <>
              <RecipeDetailView 
                recipe={currentRecipe} 
                onBack={() => setActiveView('recipe')}
                onEdit={() => handleEditRecipe(currentRecipe)}
                onDelete={() => setShowDeleteConfirm(true)}
              />
              
              <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Alert variant="danger">
                    Are you sure you want to delete "{currentRecipe.name}"?
                  </Alert>
                  <p>This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDeleteRecipe}>
                    Delete Recipe
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          ) : null;
        case 'plan':
          return (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Meal Plans</h2>
                  <Button variant="outline-primary" onClick={() => setShowAddPlanModal(true)}>
                    <img src={"./imgs/plus.png"} alt="Add Plan" style={{ height: '20px', marginRight: '8px' }} />
                    Add Plan
                  </Button>
                </div>
                
                <Row xs={1} md={2} lg={3} className="g-4">
                  {plans.map(plan => (
                    <Col key={plan.id}>
                      <PlanCard 
                        plan={plan} 
                        onClick={() => handleViewPlan(plan)} 
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          );
        case 'plan-detail':
          return currentPlan ? (
            <PlanDetailView
              plan={currentPlan}
              recipes={recipes}
              onBack={() => setActiveView('plan')}
              onAddRecipe={handleAddRecipeToPlan}
              onRemoveRecipe={handleRemoveRecipeFromPlan}
            />
          ) : null;
        case 'list':
          return (
            <div className="card">
              <div className="card-body">
                <h2>Shopping List</h2>
                <p>This is where your shopping list will appear.</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    };
  
    return (
      <div className="d-flex flex-column vh-100">
        <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
          <Navbar.Brand>Welcome!</Navbar.Brand>
          
          <Nav className="me-auto">
            <Nav.Link 
              active={activeView === 'recipe' || activeView === 'recipe-detail'} 
              onClick={() => setActiveView('recipe')}
            >
              Recipes
            </Nav.Link>
            <Nav.Link 
              active={activeView === 'plan' || activeView === 'plan-detail'} 
              onClick={() => setActiveView('plan')}
            >
              Plans
            </Nav.Link>
            <Nav.Link 
              active={activeView === 'list'} 
              onClick={() => setActiveView('list')}
            >
              List
            </Nav.Link>
          </Nav>
  
          <Dropdown align="end">
            <Dropdown.Toggle variant="dark" id="dropdown-user">
              User
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-dark">
              <Dropdown.Item className="text-white hover-bg-gray-800">
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                className="text-white hover-bg-gray-800"
                onClick={() => console.log('Logout clicked')}
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar>
  
        <div className="flex-grow-1 p-4">
          {renderView()}
        </div>
  
        <Modal show={showAddRecipeModal} onHide={() => setShowAddRecipeModal(false)} size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">
              {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            <Form onSubmit={handleSubmit}>
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="mb-3 fw-bold">Recipe Info</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Recipe Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter recipe name"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                    className="border-0 border-bottom rounded-0"
                    required
                  />
                </Form.Group>
  
                <Form.Group className="mb-3">
                  <Form.Label>Featured Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border-0 border-bottom rounded-0"
                  />
                </Form.Group>
              </div>
  
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="mb-3 fw-bold">Ingredients</h5>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <Form.Control
                    key={index}
                    type="text"
                    placeholder={`Ingredient ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className="mb-2 border-0 border-bottom rounded-0"
                    required
                  />
                ))}
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleAddIngredient}
                  className="mt-2"
                >
                  + Add Ingredient
                </Button>
              </div>
  
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="mb-3 fw-bold">Instructions</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter step-by-step instructions"
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                    className="border-0 border-bottom rounded-0"
                  />
                </Form.Group>
              </div>
  
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="mb-3 fw-bold">Notes</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2}
                    placeholder="Any additional notes"
                    value={newRecipe.notes}
                    onChange={(e) => setNewRecipe({...newRecipe, notes: e.target.value})}
                    className="border-0 border-bottom rounded-0"
                  />
                </Form.Group>
              </div>
  
              <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" onClick={() => setShowAddRecipeModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="px-4">
                  {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
  
        <Modal show={showAddPlanModal} onHide={() => setShowAddPlanModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Meal Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Plan Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., 'Weekly Dinner Plan'"
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddPlanModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreatePlan}>
              Create Plan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };
  
  export default Main;