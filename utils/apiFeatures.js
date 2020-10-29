class ApiFeatures {
  constructor(toursQuery, queryString) {
    this.toursQuery = toursQuery;
    this.queryString = queryString;
  }

  filtering() {
    let queryObj = { ...this.queryString };
    let excludingFields = ['page', 'limit', 'sort', 'fields'];
    excludingFields.forEach(el => delete queryObj[el]);
    // Filtering ToursQuery
    let newQuery = (JSON.stringify(queryObj)).replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    newQuery = JSON.parse(newQuery);
    console.log(newQuery);
    this.toursQuery = this.toursQuery.find(newQuery);
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    let skip = (page - 1) * limit;
    this.toursQuery = this.toursQuery.skip(skip).limit(limit);
    return this;
  }

  fieldsLimiting() {
    if (this.queryString.fields) {
      let fields = (this.queryString.fields).split(',').join(' ');
      this.toursQuery = this.toursQuery.select(fields);
    } else {
      this.toursQuery = this.toursQuery.select('-__v');
    }
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      let sortBy = (this.queryString.sort).split(',').join(' ');
      this.toursQuery = this.toursQuery.sort(sortBy);
    } else {
      this.toursQuery = this.toursQuery.sort('-createdAt');
    }
    return this;
  }
}

module.exports = ApiFeatures;

