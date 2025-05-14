
import User from '../models/userModel'; 

export const registerUser = async (req, res) => {
    const { email, username, fullname, password } = req.body;
    
    try {
        const user = new User({
            "personal_info": { email, username, fullname, password }
        });

        await user.save();
        res.status(201).json(user);  // Send the newly created user back
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Get user info
export const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.uid); // Assume user is authenticated with Firebase token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user info', error });
    }
};
