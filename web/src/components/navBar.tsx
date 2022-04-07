import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetch}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    });
    let body = null;
    // console.log("data::", data);
    // console.log("fetching::", fetching);
    
    
    if (fetching) {
        
    } else if (!data?.me) {
        body = (
            <>
            <NextLink href={"/login"}>
                <Link mr={2}>Login</Link> 
            </NextLink>
            <NextLink href={"/register"}>
                <Link>Register</Link>
            </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <Box mr={4}>{data.me.username}</Box>
                <Button onClick={() => {
                    logout();
                }} isLoading={logoutFetch}>Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex bg={"tomato"} p="4">
        <Box ml={"auto"}>
            {body}
        </Box>
        </Flex>
    )
}