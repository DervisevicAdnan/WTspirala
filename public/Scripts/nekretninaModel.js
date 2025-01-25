const Sequelize = require("sequelize");
const sequelize = require("./baza.js");

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

  return Nekretnina;
};