import DataLoader from "dataloader"
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User"

export const createUpdootLoader = () => 
    new DataLoader<{postId: number; userId: number}, Updoot | null>(
        async (keys) => {
            // const users = User.findByIds(userIds);
            const updoots = await Updoot.findByIds(keys as any);
            // console.log("updoots::", updoots);
            
            const updootIdsToUpdoot: Record<string, Updoot> = {};
            updoots.forEach((updoot) => {
                // console.log("u::", updoot);
                updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
            })

            // console.log("updootIdsToUpdoot::", updootIdsToUpdoot);
            
            return keys.map((key) => {
                // console.log("key::", key, updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
                return updootIdsToUpdoot[`${key.userId}|${key.postId}`]
            })
        }
    )