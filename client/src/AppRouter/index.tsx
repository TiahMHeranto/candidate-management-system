import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Login } from "../Pages/AuthenticationPage"
import { Candidates } from "../Pages/Candidates"

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />}></Route>
                <Route path="/candidates" element={<Candidates />}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter