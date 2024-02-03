import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    mrpPrice: {
        type: Number,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    tax: {
        type: Number,
        required: true,
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    attributes: {
        type: Array
    },
    categories: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    checked: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    attributesRequired:{
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

let Dataset = mongoose.models.product || mongoose.model('product', productSchema)
export default Dataset