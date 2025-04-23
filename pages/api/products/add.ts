const product = await Product.create({
    name,
    price,
    category,
    image,
    featured,
    storeId: user._id, // 🟢 نربط المنتج بالمحل
  });
  