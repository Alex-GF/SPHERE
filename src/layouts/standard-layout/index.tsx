import Header from "./header";
import Main from "./main";

export default function StandardLayout({children}: {children?: React.ReactNode}){
    return (
        <>
            <Header/>
            <Main>{children}</Main>
        </>
    );
}