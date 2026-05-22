import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ["user", "ai"]
    },

    content: {
        type: String,
        required: true
    }
})

const websiteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    title: {
        type: String,
        default: "Untitled Website"
    },

    latestCode: {
        type: String,
        required: true
    },

    conversation: [
        chatSchema
    ],

    isDeployed: {
        type: Boolean,
        default: false
    },

    deployedUrl: String,

    slug: {
        type: String,
        unique: true,
        sparse: true
    }


}, {timestamps: true});

const website = mongoose.model("website", websiteSchema);
export default website;