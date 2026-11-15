import React, {
    useEffect,
    useState
} from "react";

import api
    from "../services/api.js";

import JobCard
    from "../components/JobCard.jsx";

import {
    useAuth
} from "../context/AuthContext.jsx";


const Dashboard = () => {

    const {
        user
    } = useAuth();


    const [jobs, setJobs] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadJobs = async () => {

            try {

                const response =
                    await api.get(
                        "/jobs"
                    );

                setJobs(
                    response.data.jobs ||
                    []
                );

            } catch (error) {

                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to load jobs"
                );

            } finally {

                setLoading(false);
            }
        };


        loadJobs();

    }, []);


    if (loading) {

        return (
            <div className="page-loading">
                Loading jobs...
            </div>
        );
    }


    return (

        <div>

            <section className="dashboard-header">

                <div>

                    <p className="eyebrow">
                        FREELANCE ESCROW
                    </p>

                    <h1>
                        Welcome, {user?.name}
                    </h1>

                    <p>
                        Manage freelance jobs
                        and secure cryptocurrency
                        payments through blockchain
                        escrow.
                    </p>

                </div>

            </section>


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            <div className="section-header">

                <div>

                    <h2>
                        Available Jobs
                    </h2>

                    <p>
                        Browse jobs currently
                        registered in the system.
                    </p>

                </div>

            </div>


            {jobs.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No jobs available
                    </h3>

                    <p>
                        New jobs will appear
                        here.
                    </p>

                </div>

            ) : (

                <div className="job-grid">

                    {jobs.map(
                        (job) => (

                            <JobCard
                                key={
                                    job._id
                                }
                                job={job}
                            />

                        )
                    )}

                </div>

            )}

        </div>
    );
};


export default Dashboard;