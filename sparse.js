// sparse.js
// Creates a sparse matrix

function SparseMatrix(default_val) {
    return {
        data: {},

        set: function(y, x, val) {
            if(val === default_val) {
                if(this.data[y] == undefined)
                    return;
                if(this.data[y][x] == undefined)
                    return;
                delete this.data[y][x];
            }

            if(this.data[y] == undefined)
                this.data[y] = {};
            this.data[y][x] = val;
        },

        get: function(y, x) {
            var column = this.data[y];
            if(column == undefined)
                return default_val;

            return column[x] || default_val;
        }
    }
}
