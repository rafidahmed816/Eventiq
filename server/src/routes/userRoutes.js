
import express from 'express';
import { registerUser, getUserInfo } from '../controllers/userController'; // Import your controller
import verifyToken from '../middleware/firebaseAuth'; // Firebase authentication middleware

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Protected route (needs authentication)
router.get('/me', verifyToken, getUserInfo);

export default router;
