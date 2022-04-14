import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { route } from "next/dist/server/router";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
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
            <Flex align={"center"}>
                <NextLink href={"/create-post"}>
                    <Link mr={4}>
                        <Button>Create Post</Button> 
                    </Link>
                </NextLink>
                <Box mr={4}>{data.me.username}</Box>
                <Button onClick={async () => {
                    await logout();
                    router.reload();
                }} isLoading={logoutFetch}>Logout</Button>
            </Flex>
        )
    }
    return (
        <Flex bg={"tomato"} position="sticky" zIndex={1} top={"0"} p="4">
            <Flex flex={1} m="auto" maxWidth={800} align="center">
                <NextLink href={"/"}>
                    <Link>
                        <Heading> Home</Heading>
                    </Link>
                </NextLink>
                <Box ml={"auto"}>
                    {body}
                </Box>
            </Flex>
        </Flex>
    )
}