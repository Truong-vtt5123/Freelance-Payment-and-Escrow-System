import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// ==========================================
// COMPONENTS
// ==========================================

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ==========================================
// PUBLIC PAGES
// ==========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// USER PAGES
// ==========================================

import Dashboard from "./pages/Dashboard";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import MyJobs from "./pages/MyJobs";
import Transactions from "./pages/Transactions";

// ==========================================
// ADMIN PAGES
// ==========================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import CreateCompany from "./pages/CreateCompany";

import CreateCustomer from "./pages/CreateCustomer";


import { LanguageTextSync } from "./i18n/LanguageContext";
import Settings from "./pages/Settings";


// ==========================================
// APP
// ==========================================

function App() {
    return (
        <>
            {/* ==================================
                NAVBAR
            ================================== */}

            <Navbar />
            <LanguageTextSync />


            {/* ==================================
                ROUTES
            ================================== */}

            <Routes>

                {/* ==============================
                    PUBLIC ROUTES
                ============================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==============================
                    NORMAL USER DASHBOARD

                    Cho phép:
                    - company
                    - customer
                    - freelancer
                ============================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute
                            roles={[
                                "company",
                                "customer",
                                "freelancer"
                            ]}
                        >
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    CREATE JOB

                    Chỉ tài khoản COMPANY
                    do Admin tạo mới được đăng tuyển
                ============================== */}

                <Route
                    path="/create-job"
                    element={
                        <ProtectedRoute
                            roles={["company"]}
                        >
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    JOB DETAILS
                ============================== */}

                <Route
                    path="/jobs/:id"
                    element={
                        <ProtectedRoute
                            roles={[
                                "company",
                                "customer",
                                "freelancer"
                            ]}
                        >
                            <JobDetails />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    MY JOBS
                ============================== */}

                <Route
                    path="/my-jobs"
                    element={
                        <ProtectedRoute
                            roles={[
                                "company",
                                "customer",
                                "freelancer"
                            ]}
                        >
                            <MyJobs />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    TRANSACTIONS
                ============================== */}

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute
                            roles={[
                                "company",
                                "customer",
                                "freelancer"
                            ]}
                        >
                            <Transactions />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    ADMIN DASHBOARD
                ============================== */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            roles={["admin"]}
                        >
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    ADMIN - USER MANAGEMENT
                ============================== */}

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute
                            roles={["admin"]}
                        >
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    ADMIN - CREATE COMPANY

                    Admin tạo tài khoản công ty /
                    nhà tuyển dụng
                ============================== */}

                <Route
                    path="/admin/create-company"
                    element={
                        <ProtectedRoute
                            roles={["admin"]}
                        >
                            <CreateCompany />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    ROOT

                    Khi truy cập localhost:5173
                    chuyển sang Login
                ============================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* ==============================
                    404

                    URL không tồn tại
                    chuyển về Login
                ============================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* ADMIN - CREATE CUSTOMER */}

                <Route
                    path="/admin/create-client"
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <CreateCustomer />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={<Settings />}
                />



            </Routes>
        </>
    );
}

export default App;