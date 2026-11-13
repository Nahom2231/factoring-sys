import axios from "../api/axios";

const getToken = () => {
    return localStorage.getItem("token");
};

export const getPricingRules = async () => {
    const response = await axios.get("/pricing-rules", {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};

export const getDefaultPricingRule = async () => {
    const response = await axios.get("/pricing-rules/default", {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};

export const getPricingRuleById = async (id) => {
    const response = await axios.get(`/pricing-rules/${id}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};

export const createPricingRule = async (rule) => {
    const response = await axios.post("/pricing-rules", rule, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};

export const updatePricingRule = async (id, rule) => {
    const response = await axios.put(`/pricing-rules/${id}`, rule, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};

export const deletePricingRule = async (id) => {
    const response = await axios.delete(`/pricing-rules/${id}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data;
};
