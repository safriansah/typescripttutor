import { NavBar } from "./navBar"
import { Wrapper, WrapperVariant } from "./wrapper"

interface LayoutProps {
    variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant}) => {
    return (
        <><NavBar>
        </NavBar>
        <Wrapper variant={variant}>
            
            {children}
        </Wrapper>
        </>
    )
}