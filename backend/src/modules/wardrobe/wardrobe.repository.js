const Wardrobe =
    require(
        './wardrobe.model'
    );

const createItem =
    (data) => {

        return Wardrobe
            .create(data);

    };

const getItemsByUser = (userId) => {
    return Wardrobe
        .find({ userId }).sort({ createdAt: -1 });
}

const getItemById = (itemId, userId) => {
    return Wardrobe
        .findById({ _id: itemId, userId });
}

const updateItem = (
    itemId,
    userId,
    data
) => {

    return Wardrobe
        .findOneAndUpdate(

            {
                _id: itemId,
                userId
            },

            data,

            {
                new: true
            }

        );

};

module.exports = {
    createItem,
    getItemsByUser,
    getItemById,
    updateItem
};