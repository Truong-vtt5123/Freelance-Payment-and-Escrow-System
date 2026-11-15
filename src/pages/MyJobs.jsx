import React, {
    useEffect,
    useState
} from "react";

import api
    from "../services/api.js";

import JobCard
    from "../components/JobCard.jsx";


const MyJobs = () => {

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
                        "/jobs/my-jobs"
                    );

                setJobs(
                    response.data.jobs ||
                    []
                );

            } catch (error) {

                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to load your jobs"
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
                Loading your jobs...
            </div>
        );
    }


    return (

        <div>

            <div className="section-header">

                <div>

                    <h1>
                        My Jobs
                    </h1>

                    <p>
                        Jobs associated with
                        your account.
                    </p>

                </div>

            </div>


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {jobs.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No jobs found
                    </h3>

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


export default MyJobs;