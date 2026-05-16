import User from '../models/user.js';

function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export const signup = async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const email = req.body.email?.trim();
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const user = new User({ username, email });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found. Sign up first." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const body = {
      ...req.body,
      username: normalizeUsername(req.body.username),
      email: req.body.email?.trim(),
    };
    const user = new User(body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async(req, res) =>{
    try{
        const users = await User.find();
        res.status(200).json(users);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

export const getUserById = async(req, res) =>{
    try{
        const user = await User.findById(req.params.id);    
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

export const updateUser = async(req, res) =>
{
    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new:true
        });
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status (500).json({message:error.message});
    }
};

export const deleteUser = async(req,res) =>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
    return res.status(404).json({ message: "Not found" });
        }
        res.json({ message: "Deleted successfully" });
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
};
