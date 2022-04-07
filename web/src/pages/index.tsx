import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/navBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [{data}] = usePostsQuery();
    return (
        <>
            <NavBar></NavBar>
            <div>Hello gaes</div><hr /><br />
            {data?.posts ? data.posts.map((p) => <div key={p.id}>{p.title}</div>) : "loading..."}
        </>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
