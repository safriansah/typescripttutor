import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
    post: PostSnippetFragment
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const [_, vote] = useVoteMutation();
    const [loadingState, setLoadingState] = useState<"updoot-load" | "downdoot-load" | "not-load">("not-load");
    return (
        <Flex direction={"column"} alignItems="center" justifyContent={"center"} mr="12px">
            <IconButton icon={<ChevronUpIcon />} aria-label={"Up"}
            isLoading={loadingState === "updoot-load"}
            colorScheme={post.voteStatus === 1 ? "green" : undefined}
            onClick={() => {
                if (post.voteStatus === 1) {
                    return
                }
                setLoadingState("updoot-load");
                vote({
                    postId: post.id,
                    value: 1
                })
                setLoadingState("not-load");
            }}/>
            {post.points}
            <IconButton icon={<ChevronDownIcon />} aria-label={"Down"}
            colorScheme={post.voteStatus === -1 ? "red" : undefined}
            isLoading={loadingState === "downdoot-load"}
            onClick={() => {
                if (post.voteStatus === -1) {
                    return
                }
                setLoadingState("downdoot-load");
                vote({
                    postId: post.id,
                    value: -1
                })
                setLoadingState("not-load");
            }}/>
        </Flex>
    )
};