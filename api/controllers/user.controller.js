import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

const saltRounds = 10;


export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({ users });        
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get users!" })
    }
};

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {id},
        });
        res.status(200).json({ user }); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get user!" })
    } 
};

export const updateUser = async (req, res) => {

    const id = req.params.id;
    const tokenUserId = req.userId;
    const {password, avatar, ...inputs} = req.body;

    if (id !== tokenUserId) {
        return res.status(403).json({ message: "Not authorized." });
    }
    
    let updatedPassword = null;
    try {

        if (password) {
            updatedPassword = await bcrypt.hash(password, saltRounds);
        }

       const updatedUser = await prisma.user.update({
        where: {id},
        data: {
            ...inputs,
            ...(updatedPassword && { password: updatedPassword }),
            ...(avatar && {avatar})
        },
       }); 
       const {password: userPassword, ...rest} = updatedUser;
       res.status(200).json(rest);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update user!" })
    }
};

export const deleteUser = async (req, res) => {

    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId) {
        return res.status(403).json({ message: "Not authorized." });
    }
    
    try {
        await prisma.user.delete({
            where: {id}
        });
        res.status(200).json({ message: "User deleted." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to delete user!" });
    }
};

export const savePost = async (req, res) => {

    const postId = req.body.postId;

    const tokenUserId = req.userId;
    
    try {

        const savedPost = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId:tokenUserId,
                    postId,
                },
            },
        });

        if (savedPost) {

            await prisma.savedPost.delete({
                where: {
                    id: savePost.id,
                },
            });

            res.status(200).json({ message: "Post removed from saved list." });
            
        }
        
    } catch (err) {

        console.log(err);

        res.status(500).json({ message: "Failed to save post!" });

    }

};
