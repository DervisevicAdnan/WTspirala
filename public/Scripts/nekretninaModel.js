const Sequelize = require("sequelize");
const sequelize = require("./baza.js");
const Zahtjev = require("./zahtjevModel.js")(sequelize);
const Ponuda = require("./ponudaModel.js")(sequelize);
const Upit = require("./upitModel.js")(sequelize);

module.exports = function (sequelize, DataTypes) {
    const Nekretnina = sequelize.define('Nekretnina', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tip_nekretnine: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        naziv: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        kvadratura: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        cijena: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        tip_grijanja: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lokacija: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        godina_izgradnje: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        datum_objave: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        opis: {
            type: Sequelize.TEXT,
        },
    },
    {
        timestamps: false,
        tableName: 'Nekretnina'
    });



    Object.defineProperty(Nekretnina.prototype, 'getInteresovanja', {
        get: async function () {
            // console.log("Hoce?");
            let upiti = await Upit.findAll({
                where: {
                    "nekretninaId": this.id
                }
            });
            upiti = upiti.map(upit => upit.dataValues);

            let zahtjevi = await Zahtjev.findAll({
                where: {
                    "nekretninaId": this.id
                }
            });
            zahtjevi = zahtjevi.map(zahtjev => zahtjev.dataValues);

            let ponude = await Ponuda.findAll({
                where: {
                    "nekretninaId": this.id
                }
            });
            ponude = ponude.map(ponuda => ponuda.dataValues);

            return [...upiti,...zahtjevi,...ponude];
        }
    });

    return Nekretnina;
};