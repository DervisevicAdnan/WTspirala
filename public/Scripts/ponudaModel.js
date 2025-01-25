const Sequelize = require("sequelize");
const sequelize = require("./baza.js");

module.exports = function (sequelize, DataTypes) {
    const Ponuda = sequelize.define('Ponuda', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        korisnikId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Korisnik',
                key: 'id'
            }
        },
        nekretninaId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Nekretnina',
                key: 'id',
            },
            allowNull: false,
        },
        tekst: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        cijenaPonude: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        datumPonude: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        odbijenaPonuda: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        vezanaPonudaId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Ponuda',
                key: 'id'
            },
            allowNull: true
        }
    }, {
        timestamps: false,
        tableName: 'Ponuda',
    });

    /*Ponuda.prototype.vezanePonude = async function () {
        const getRelatedOffers = async (ponuda) => {
            console.log("uslooo");
            const relatedOffers = await Ponuda.findAll({
                where: { vezanaPonudaId: ponuda.id }
            });

            if (relatedOffers.length === 0) {
                return ponuda;
            }

            const children = await Promise.all(relatedOffers.map(getRelatedOffers));

            return {
                ...ponuda,
                children
            }
        };

        return getRelatedOffers(this);
    };*/

    Object.defineProperty(Ponuda.prototype, 'vezanePonude', {
        get: async function() {
            const getRelatedOffers = async (ponuda) => {
            
                const relatedOffers = await Ponuda.findAll({
                    where: { vezanaPonudaId: ponuda.id }
                });
    
                if (relatedOffers.length === 0) {
                    return ponuda.dataValues;
                }
    
                const children = await Promise.all(relatedOffers.map(getRelatedOffers));
                //console.log("children",children)
    
                return [ponuda.dataValues].concat(children);
            };

            return await getRelatedOffers(this);
        }
    });

    return Ponuda;
};