import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";


// ==========================================
// CREATE CONTEXT
// ==========================================

const AuthContext = createContext(null);


// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // ======================================
    // LOAD LOGIN INFORMATION
    // Chỉ chạy 1 lần khi website khởi động
    // ======================================

    useEffect(() => {

        try {

            const token =
                localStorage.getItem("token");

            const savedUser =
                localStorage.getItem("user");


            if (token && savedUser) {

                const parsedUser =
                    JSON.parse(savedUser);

                setUser(parsedUser);

            } else {

                setUser(null);

            }

        } catch (error) {

            console.error(
                "LOAD AUTH ERROR:",
                error
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);

        } finally {

            setLoading(false);

        }

    }, []);


    // ======================================
    // LOGIN
    // ======================================

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email,
                        password
                    }
                );


            const {
                token,
                user: loggedInUser
            } = response.data;


            if (!token) {

                throw new Error(
                    "Server không trả về token."
                );

            }


            if (!loggedInUser) {

                throw new Error(
                    "Server không trả về thông tin người dùng."
                );

            }


            // Save token
            localStorage.setItem(
                "token",
                token
            );


            // Save user
            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );


            // Update React
            setUser(loggedInUser);


            console.log(
                "LOGIN USER:",
                loggedInUser
            );


            return loggedInUser;

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            throw error;

        }

    };


    // ======================================
    // REGISTER
    // Dành cho user tự đăng ký
    // ======================================

    const register = async (userData) => {

        try {

            const response =
                await api.post(
                    "/auth/register",
                    userData
                );

            return response.data;

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );

            throw error;

        }

    };


    // ======================================
    // LOGOUT
    // ======================================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

    };


    // ======================================
    // ROLE
    // ======================================

    const isAdmin =
        user?.role === "admin";

    const isCompany =
        user?.role === "company";

    const isCustomer =
        user?.role === "customer";

    const isFreelancer =
        user?.role === "freelancer";


    // ======================================
    // CONTEXT VALUE
    // ======================================

    const value = {

        user,

        loading,

        login,

        register,

        logout,

        isAuthenticated: !!user,

        isAdmin,

        isCompany,

        isCustomer,

        isFreelancer

    };


    // ======================================
    // PROVIDER
    // ======================================

    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>

    );

}


// ==========================================
// USE AUTH HOOK
// ==========================================

export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth phải được sử dụng bên trong AuthProvider."
        );

    }


    return context;

}


export default AuthContext;