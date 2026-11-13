import axios from "../api/axios";

const getToken = () => {
    return localStorage.getItem("token");
};

export const getAssessments = async () => {

    const response = await axios.get(
        "/credit-assessments",
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });

    return response.data;
};

export const createAssessment =
    async (assessment) => {

    const response =
        await axios.post(
            "/credit-assessments",
            assessment,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const updateAssessment =
    async (id, assessment) => {

    const response =
        await axios.put(
            `/credit-assessments/${id}`,
            assessment,
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            });

    return response.data;
};

export const deleteAssessment =
    async (id) => {

    await axios.delete(
        `/credit-assessments/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        });
};