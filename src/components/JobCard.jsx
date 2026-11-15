import React from "react";

import {
    Link
} from "react-router-dom";


const JobCard = ({
    job
}) => {

    if (!job) {
        return null;
    }


    return (

        <div className="job-card">

            <div className="job-card-header">

                <h3>
                    {job.title}
                </h3>

                <span
                    className={`status status-${job.status?.toLowerCase()}`}
                >
                    {job.status}
                </span>

            </div>


            <p className="job-description">

                {job.description}

            </p>


            <div className="job-information">

                <div>

                    <span>
                        Budget
                    </span>

                    <strong>
                        {job.amount} ETH
                    </strong>

                </div>


                <div>

                    <span>
                        Deadline
                    </span>

                    <strong>

                        {job.deadline
                            ? new Date(
                                job.deadline
                            ).toLocaleDateString()
                            : "N/A"}

                    </strong>

                </div>

            </div>


            <Link
                to={`/jobs/${job._id}`}
                className="view-job-button"
            >
                View Job
            </Link>

        </div>
    );
};


export default JobCard;