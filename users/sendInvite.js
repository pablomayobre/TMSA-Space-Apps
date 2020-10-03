const nodemailer = require("nodemailer");
const credentials = require("../credentials.json");

/**
 * @typedef {"title"|"titleHtml"|"main"|"mainHtml"|"why"|"whyHtml"} TextKeys
 * @typedef {TextKeys|"inviteCode"} AllKeys
 */


/**
 * @type {Record<import("./model").Role, Record<TextKeys, (location: string) => string>>}
 */
const text = {
  organizer: {
    title: () => "¡Has sido invitado!",
    titleHtml: () => "&#161;Has sido invitado!",
    /**
     * @param {string} location
     */
    main: (location) =>
      `Te han invitado a formar parte de la organización del NASA Space Apps Challenge en el servidor de Discord, como miembro de The Mars Society Argentina en la localidad de ${location}.`,
    /**
     * @param {string} location
     */
    mainHtml: (location) =>
      `Te han invitado a formar parte de la organizaci&#243;n del <strong>NASA Space Apps Challenge</strong> en el servidor de <strong>Discord</strong>,&nbsp;como miembro de The Mars Society Argentina en la localidad de ${location}.`,
    why: () =>
      "Has recibido este correo electrónico por formar parte de The Mars Society Argentina y expresar la voluntad de ayudar con el evento, el cual se realizará en Discord. Para ingresar al servidor de Discord y obtener los roles de Organizador se requiere ingresar al link.",
    whyHtml: () =>
      "Has recibido este correo electr&#243;nico por formar parte de The Mars Society Argentina y expresar la voluntad de ayudar con el evento, el cual se realizar&#225; en Discord. Para ingresar al servidor de Discord y obtener el rol de Organizador se requiere ingresar al link.",
  },

  participant: {
    title: () => "¡Bienvenido!",
    titleHtml: () => "&#161;Bienvenido!",
    main: () =>
      "Ya hemos recibido tu inscripción al NASA Space Apps Challenge y queremos extenderte la invitación a nuestro servidor de Discord, plataforma que se utilizará como método principal de comunicación durante el evento.",
    mainHtml: () =>
      "Ya hemos recibido tu inscripci&#243;n al <strong>NASA Space Apps Challenge</strong> y queremos extenderte la invitaci&#243;n a nuestro servidor de <strong>Discord</strong>, plataforma que se utilizar&#225; como método principal de comunicaci&#243;n durante el evento.",
    /**
     * @param {string} location
     */
    why: (location) =>
      `Has recibido este correo electrónico tras registrarte en la página oficial del NASA Space Apps Challenge especificando que tu localidad es ${location}. Para participar del evento, es necesario que te unas al servidor de Discord, para lo cual se requiere esta invitación.`,
    /**
     * @param {string} location
     */
    whyHtml: (location) =>
      `Has recibido este correo electr&#243;nico tras registrarte en la p&#225;gina oficial del NASA Space Apps Challenge especificando que tu localidad es ${location}. Para particpar del evento, es necesario que te unas al servidor de Discord, para lo cual se requiere esta invitaci&#243;n.`,
  },

  sponsor: {
    title: () => "¡Has sido invitado!",
    titleHtml: () => "&#161;Has sido invitado!",
    main: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitación para que puedan formar parte del servidor de Discord del NASA SpaceApps Challenge. Esta plataforma será el canal principal de comunicación durante el evento.",
    mainHtml: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitaci&#243;n para que puedan formar parte del servidor de <strong>Discord</strong> del <strong>NASA SpaceApps Challenge</strong>. Esta plataforma ser&#225; el canal principal de comunicaci&#243;n durante el evento.",
    why: () =>
      "Has recibido este correo electrónico tras confirmar su colaboración como patrocinador del evento (NASA SpaceApps Challenge) o de la organización (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a través de esta invitación, para contar con su presencia durante el evento.",
    whyHtml: () =>
      "Has recibido este correo electr&#243;nico tras confirmar su colaboraci&#243;n como patrocinador del evento (NASA SpaceApps Challenge) o de la organizaci&#243;n (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a trav&#233;s de esta invitaci&&245n, para contar con su presencia durante el evento.",
  },

  judge: {
    title: () => "¡Has sido invitado!",
    titleHtml: () => "&#161;Has sido invitado!",
    main: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitación para que puedan formar parte del servidor de Discord del NASA SpaceApps Challenge. Esta plataforma será el canal principal de comunicación durante el evento.",
    mainHtml: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitaci&#243;n para que puedan formar parte del servidor de <strong>Discord</strong> del <strong>NASA SpaceApps Challenge</strong>. Esta plataforma ser&#225; el canal principal de comunicaci&#243;n durante el evento.",
    why: () =>
      "Has recibido este correo electrónico tras confirmar su colaboración como sponsor del evento (NASA SpaceApps Challenge) o de la organización (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a través de esta invitación, para contar con su presencia durante el evento.",
    whyHtml: () =>
      "Has recibido este correo electr&#243;nico tras confirmar su colaboraci&#243;n como patrocinador del evento (NASA SpaceApps Challenge) o de la organizaci&#243;n (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a trav&#233;s de esta invitaci&&245n, para contar con su presencia durante el evento.",
  },

  mentor: {
    title: () => "¡Has sido invitado!",
    titleHtml: () => "&#161;Has sido invitado!",
    main: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitación para que puedan formar parte del servidor de Discord del NASA SpaceApps Challenge. Esta plataforma será el canal principal de comunicación durante el evento.",
    mainHtml: () =>
      "Desde The Mars Society Argentina, estamos agradecidos por tenerlos como patrocinadores de nuestro evento, y queremos extender esta invitaci&#243;n para que puedan formar parte del servidor de <strong>Discord</strong> del <strong>NASA SpaceApps Challenge</strong>. Esta plataforma ser&#225; el canal principal de comunicaci&#243;n durante el evento.",
    why: () =>
      "Has recibido este correo electrónico tras confirmar su colaboración como sponsor del evento (NASA SpaceApps Challenge) o de la organización (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a través de esta invitación, para contar con su presencia durante el evento.",
    whyHtml: () =>
      "Has recibido este correo electr&#243;nico tras confirmar su colaboraci&#243;n como sponsor del evento (NASA SpaceApps Challenge) o de la organizaci&#243;n (The Mars Society Argentina). Por lo cual le conferimos acceso al servidor de Discord a trav&#233;s de esta invitaci&&245n, para contar con su presencia durante el evento.",
  }
};

/**
 * @param {Record<AllKeys, string>} keys
 */
const mailText = ({ title, main, why, inviteCode }) => {
  return `NASA Space Apps Challenge 2020 - The Mars Society Argentina

${title}

${main}

Para unirte al servidor, primero deberás crear una cuenta de Discord aquí. Una vez que tengas tu cuenta, hacé clic sobre el siguiente enlace, o copialo y pegalo en tu navegador, para unirte al servidor.

https://discord.gg/${inviteCode}

¡No compartas este enlace con nadie! ¡Esta invitación solo se puede utilizar una vez!

En el caso de que se te pida un código, deberás ingresar los siguientes caracteres:

${inviteCode}

Para cualquier problema o duda podés responder este mail y nos pondremos en contacto a la brevedad. También podrás encontrarnos en Instagram (https://instagram.com/mars.argentina) o Facebook (https://facebook.com/mars.argentina) y escribirnos por esos medios.

The Mars Society Argentina

Patrocinado por:
- INVAP
- CONAE
- Facultad de Ciencias Exactas, Físicas y Naturales, de San Juan
- OAFA - Observatorio Astronómico Félix Aguilar
- CASLEO - CONICET
- Hotel Boutique Galileo Galilei
- i3D, ESCAAD - Escuela Superior de Animación y Artes Digitales
- Flight Edge
- 3DMazz

Seguinos en:
- Facebook: https://facebook.com/mars.argentina
- Instagram: https://instagram.com/mars.argentina
- Youtube: https://youtube.com/channel/
- Twitter: https://twitter.com/mars_argentina
- Nuestra web: http://argentina.marssociety.com/

${why}`;
};

/**
 * @param {Record<AllKeys, string>} keys
 */
const mailHTML = ({ titleHtml, mainHtml, whyHtml, inviteCode }) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]--><!--[if !IE]><!--><html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title></title>
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <meta name="viewport" content="width=device-width"><style type="text/css">
@media only screen and (min-width: 620px){.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:36px !important;line-height:43px !important}.wrapper h2{}.wrapper h2{font-size:24px !important;line-height:32px !important}.wrapper h3{}.wrapper h3{font-size:20px !important;line-height:28px !important}.column{}.wrapper .size-8{font-size:8px !important;line-height:14px !important}.wrapper .size-9{font-size:9px !important;line-height:16px !important}.wrapper .size-10{font-size:10px !important;line-height:18px !important}.wrapper .size-11{font-size:11px !important;line-height:19px !important}.wrapper .size-12{font-size:12px !important;line-height:19px !important}.wrapper .size-13{font-size:13px !important;line-height:21px !important}.wrapper .size-14{font-size:14px !important;line-height:21px !important}.wrapper .size-15{font-size:15px !important;line-height:23px 
!important}.wrapper .size-16{font-size:16px !important;line-height:24px !important}.wrapper .size-17{font-size:17px !important;line-height:26px !important}.wrapper .size-18{font-size:18px !important;line-height:26px !important}.wrapper .size-20{font-size:20px !important;line-height:28px !important}.wrapper .size-22{font-size:22px !important;line-height:31px !important}.wrapper .size-24{font-size:24px !important;line-height:32px !important}.wrapper .size-26{font-size:26px !important;line-height:34px !important}.wrapper .size-28{font-size:28px !important;line-height:36px !important}.wrapper .size-30{font-size:30px !important;line-height:38px !important}.wrapper .size-32{font-size:32px !important;line-height:40px !important}.wrapper .size-34{font-size:34px !important;line-height:43px !important}.wrapper .size-36{font-size:36px !important;line-height:43px !important}.wrapper 
.size-40{font-size:40px !important;line-height:47px !important}.wrapper .size-44{font-size:44px !important;line-height:50px !important}.wrapper .size-48{font-size:48px !important;line-height:54px !important}.wrapper .size-56{font-size:56px !important;line-height:60px !important}.wrapper .size-64{font-size:64px !important;line-height:63px !important}}
</style>
  <meta name="x-apple-disable-message-reformatting">
  <style type="text/css">
body {
margin: 0;
padding: 0;
}
table {
border-collapse: collapse;
table-layout: fixed;
}
* {
line-height: inherit;
}
[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
}
.wrapper .footer__share-button a:hover,
.wrapper .footer__share-button a:focus {
color: #ffffff !important;
}
.btn a:hover,
.btn a:focus,
.footer__share-button a:hover,
.footer__share-button a:focus,
.email-footer__links a:hover,
.email-footer__links a:focus {
opacity: 0.8;
}
.preheader,
.header,
.layout,
.column {
transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
}
.preheader td {
padding-bottom: 8px;
}
.layout,
div.header {
max-width: 400px !important;
-fallback-width: 95% !important;
width: calc(100% - 20px) !important;
}
div.preheader {
max-width: 360px !important;
-fallback-width: 90% !important;
width: calc(100% - 60px) !important;
}
.snippet,
.webversion {
Float: none !important;
}
.stack .column {
max-width: 400px !important;
width: 100% !important;
}
.fixed-width.has-border {
max-width: 402px !important;
}
.fixed-width.has-border .layout__inner {
box-sizing: border-box;
}
.snippet,
.webversion {
width: 50% !important;
}
.ie .btn {
width: 100%;
}
.ie .stack .column,
.ie .stack .gutter {
display: table-cell;
float: none !important;
}
.ie div.preheader,
.ie .email-footer {
max-width: 560px !important;
width: 560px !important;
}
.ie .snippet,
.ie .webversion {
width: 280px !important;
}
.ie div.header,
.ie .layout {
max-width: 600px !important;
width: 600px !important;
}
.ie .two-col .column {
max-width: 300px !important;
width: 300px !important;
}
.ie .three-col .column,
.ie .narrow {
max-width: 200px !important;
width: 200px !important;
}
.ie .wide {
width: 400px !important;
}
.ie .stack.fixed-width.has-border,
.ie .stack.has-gutter.has-border {
max-width: 602px !important;
width: 602px !important;
}
.ie .stack.two-col.has-gutter .column {
max-width: 290px !important;
width: 290px !important;
}
.ie .stack.three-col.has-gutter .column,
.ie .stack.has-gutter .narrow {
max-width: 188px !important;
width: 188px !important;
}
.ie .stack.has-gutter .wide {
max-width: 394px !important;
width: 394px !important;
}
.ie .stack.two-col.has-gutter.has-border .column {
max-width: 292px !important;
width: 292px !important;
}
.ie .stack.three-col.has-gutter.has-border .column,
.ie .stack.has-gutter.has-border .narrow {
max-width: 190px !important;
width: 190px !important;
}
.ie .stack.has-gutter.has-border .wide {
max-width: 396px !important;
width: 396px !important;
}
.ie .fixed-width .layout__inner {
border-left: 0 none white !important;
border-right: 0 none white !important;
}
.ie .layout__edges {
display: none;
}
.mso .layout__edges {
font-size: 0;
}
.layout-fixed-width,
.mso .layout-full-width {
background-color: #ffffff;
}
@media only screen and (min-width: 620px) {
.column,
.gutter {
  display: table-cell;
  Float: none !important;
  vertical-align: top;
}
div.preheader,
.email-footer {
  max-width: 560px !important;
  width: 560px !important;
}
.snippet,
.webversion {
  width: 280px !important;
}
div.header,
.layout,
.one-col .column {
  max-width: 600px !important;
  width: 600px !important;
}
.fixed-width.has-border,
.fixed-width.x_has-border,
.has-gutter.has-border,
.has-gutter.x_has-border {
  max-width: 602px !important;
  width: 602px !important;
}
.two-col .column {
  max-width: 300px !important;
  width: 300px !important;
}
.three-col .column,
.column.narrow,
.column.x_narrow {
  max-width: 200px !important;
  width: 200px !important;
}
.column.wide,
.column.x_wide {
  width: 400px !important;
}
.two-col.has-gutter .column,
.two-col.x_has-gutter .column {
  max-width: 290px !important;
  width: 290px !important;
}
.three-col.has-gutter .column,
.three-col.x_has-gutter .column,
.has-gutter .narrow {
  max-width: 188px !important;
  width: 188px !important;
}
.has-gutter .wide {
  max-width: 394px !important;
  width: 394px !important;
}
.two-col.has-gutter.has-border .column,
.two-col.x_has-gutter.x_has-border .column {
  max-width: 292px !important;
  width: 292px !important;
}
.three-col.has-gutter.has-border .column,
.three-col.x_has-gutter.x_has-border .column,
.has-gutter.has-border .narrow,
.has-gutter.x_has-border .narrow {
  max-width: 190px !important;
  width: 190px !important;
}
.has-gutter.has-border .wide,
.has-gutter.x_has-border .wide {
  max-width: 396px !important;
  width: 396px !important;
}
}
@supports (display: flex) {
@media only screen and (min-width: 620px) {
  .fixed-width.has-border .layout__inner {
    display: flex !important;
  }
}
}
@media (max-width: 321px) {
.fixed-width.has-border .layout__inner {
  border-width: 1px 0 !important;
}
.layout,
.stack .column {
  min-width: 320px !important;
  width: 320px !important;
}
.border {
  display: none;
}
.has-gutter .border {
  display: table-cell;
}
}
.mso div {
border: 0 none white !important;
}
.mso .w560 .divider {
Margin-left: 260px !important;
Margin-right: 260px !important;
}
.mso .w360 .divider {
Margin-left: 160px !important;
Margin-right: 160px !important;
}
.mso .w260 .divider {
Margin-left: 110px !important;
Margin-right: 110px !important;
}
.mso .w160 .divider {
Margin-left: 60px !important;
Margin-right: 60px !important;
}
.mso .w354 .divider {
Margin-left: 157px !important;
Margin-right: 157px !important;
}
.mso .w250 .divider {
Margin-left: 105px !important;
Margin-right: 105px !important;
}
.mso .w148 .divider {
Margin-left: 54px !important;
Margin-right: 54px !important;
}
.mso .size-8,
.ie .size-8 {
font-size: 8px !important;
line-height: 14px !important;
}
.mso .size-9,
.ie .size-9 {
font-size: 9px !important;
line-height: 16px !important;
}
.mso .size-10,
.ie .size-10 {
font-size: 10px !important;
line-height: 18px !important;
}
.mso .size-11,
.ie .size-11 {
font-size: 11px !important;
line-height: 19px !important;
}
.mso .size-12,
.ie .size-12 {
font-size: 12px !important;
line-height: 19px !important;
}
.mso .size-13,
.ie .size-13 {
font-size: 13px !important;
line-height: 21px !important;
}
.mso .size-14,
.ie .size-14 {
font-size: 14px !important;
line-height: 21px !important;
}
.mso .size-15,
.ie .size-15 {
font-size: 15px !important;
line-height: 23px !important;
}
.mso .size-16,
.ie .size-16 {
font-size: 16px !important;
line-height: 24px !important;
}
.mso .size-17,
.ie .size-17 {
font-size: 17px !important;
line-height: 26px !important;
}
.mso .size-18,
.ie .size-18 {
font-size: 18px !important;
line-height: 26px !important;
}
.mso .size-20,
.ie .size-20 {
font-size: 20px !important;
line-height: 28px !important;
}
.mso .size-22,
.ie .size-22 {
font-size: 22px !important;
line-height: 31px !important;
}
.mso .size-24,
.ie .size-24 {
font-size: 24px !important;
line-height: 32px !important;
}
.mso .size-26,
.ie .size-26 {
font-size: 26px !important;
line-height: 34px !important;
}
.mso .size-28,
.ie .size-28 {
font-size: 28px !important;
line-height: 36px !important;
}
.mso .size-30,
.ie .size-30 {
font-size: 30px !important;
line-height: 38px !important;
}
.mso .size-32,
.ie .size-32 {
font-size: 32px !important;
line-height: 40px !important;
}
.mso .size-34,
.ie .size-34 {
font-size: 34px !important;
line-height: 43px !important;
}
.mso .size-36,
.ie .size-36 {
font-size: 36px !important;
line-height: 43px !important;
}
.mso .size-40,
.ie .size-40 {
font-size: 40px !important;
line-height: 47px !important;
}
.mso .size-44,
.ie .size-44 {
font-size: 44px !important;
line-height: 50px !important;
}
.mso .size-48,
.ie .size-48 {
font-size: 48px !important;
line-height: 54px !important;
}
.mso .size-56,
.ie .size-56 {
font-size: 56px !important;
line-height: 60px !important;
}
.mso .size-64,
.ie .size-64 {
font-size: 64px !important;
line-height: 63px !important;
}
</style>
  
<!--[if !mso]><!--><style type="text/css">
@import url(https://fonts.googleapis.com/css?family=Montserrat:400,700,400italic);
</style><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,400italic" rel="stylesheet" type="text/css"><!--<![endif]--><style type="text/css">
body{background-color:#000}.logo a:hover,.logo a:focus{color:#7096b5 !important}.mso .layout-has-border{border-top:1px solid #000;border-bottom:1px solid #000}.mso .layout-has-bottom-border{border-bottom:1px solid #000}.mso .border,.ie .border{background-color:#000}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:36px !important;line-height:43px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:24px !important;line-height:32px !important}.mso h3,.ie h3{}.mso h3,.ie h3{font-size:20px !important;line-height:28px !important}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:Montserrat,DejaVu Sans,Verdana,sans-serif}
</style></head>
<!--[if mso]>
<body class="mso">
<![endif]-->
<!--[if !mso]><!-->
<body class="half-padding" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%; background-color:#DEADBE">
<!--<![endif]-->
  <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: transparent;" cellpadding="0" cellspacing="0" role="presentation"><tbody bgcolor="black" style="background-image: url(https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601225852/fondo_wd1zmy.jpg); background-position: center; background-size: cover;"><tr><td>
    <div role="banner">
      <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
        <div style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->
          <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #fff;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
            <p style="Margin-top: 0;Margin-bottom: 0;">Bienvenido al SpaceApps Challenge organizado por The Mars Society Argentina<div style="mso-hide:all;position:fixed;height:0;max-height:0;overflow:hidden;font-size:0;"></div></p>
          </div>
        <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->
          <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #fff;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
            
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
      <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
      <!--[if (mso)|(IE)]><table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 600px"><![endif]-->
        <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 16px;Margin-bottom: 24px;color: #41637e;font-family: sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
          <div class="logo-center" align="center" id="emb-email-header"><a style="text-decoration: none;transition: opacity 0.1s ease-in;color: #41637e;" href="http://argentina.marssociety.org/spaceapps/"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 230px;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601249418/space_logo_pablo-01_afn8oi.png" alt="NASA Space Apps Challenge - TMSA" width="200"></a></div>
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    <div>
    <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #000000;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #fff;font-size: 16px;line-height: 24px;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 12px;">
    <div style="mso-line-height-rule: exactly;line-height: 8px;font-size: 1px;">&nbsp;</div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;text-align: center;">
      <h1 style="Margin-top: 0;Margin-bottom: 20px;font-style: normal;font-weight: normal;color: #3d3b3d;font-size: 30px;line-height: 38px;text-align: center;"><span style="color:#ffffff">${titleHtml}</span></h1>
    </div>
  </div>
                      <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
  </div>
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div class="btn btn--flat fullwidth btn--small" style="Margin-bottom: 20px;text-align: center;">
      <![if !mso]><div style="border-radius: 0;display: block;font-size: 11px;font-weight: bold;line-height: 10px;padding: 6px 12px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ee283f !important;background-color: #ee283f;font-family: Montserrat, DejaVu Sans, Verdana, sans-serif;">&nbsp;</div><![endif]>
    <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:rect xmlns:v="urn:schemas-microsoft-com:vml" style="width:560px" fillcolor="#EE283F" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,6px,0px,6px"><center style="font-size:11px;line-height:19px;color:#EE283F;font-family:Montserrat,DejaVu Sans,Verdana,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:3px">a</center></v:textbox></v:rect><![endif]--></div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 12px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
      <p class="size-20" style="Margin-top: 0;Margin-bottom: 0;font-family: montserrat,dejavu sans,verdana,sans-serif;font-size: 17px;line-height: 26px;" lang="x-size-20"><span class="font-montserrat"><span style="color:#ffffff">${mainHtml}</span></span></p><p class="size-16" style="Margin-top: 20px;Margin-bottom: 0;font-family: montserrat,dejavu sans,verdana,sans-serif;font-size: 16px;line-height: 24px;" lang="x-size-16"><span class="font-montserrat">Para unirte al servidor, primero deber&#225;s <strong><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #f30808;" 
href="https://discord.com/login">crear una cuenta de Discord aqu&#237;</a></strong>. Una vez que tengas tu cuenta, hac&#233; clic sobre el siguiente bot&#243;n para unirte al servidor.</span></p>
    </div>
  </div>
      
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div>

    <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: transparent;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #fff;font-size: 16px;line-height: 24px;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 12px;Margin-bottom: 12px;">
      <div style="font-size: 12px;font-style: normal;font-weight: normal;line-height: 19px;" align="center">
        <a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #f30808;" href="https://discord.gg/${inviteCode}"><img style="border: 0;display: block;height: auto;width: 100%;max-width: 324px;" alt="Unirse al chat del Space Apps Challenge" width="324" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601224082/join-button1-990514028a03cf3c_ybpsx3.png"></a>
      </div>
    </div>
      
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div>

    <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: transparent;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #fff;font-size: 16px;line-height: 24px;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 12px;">
    <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
            <div class="btn fullwidth btn--ghost btn--large" style="Margin-bottom: 20px;text-align: center;">
      <![if !mso]><div style="border-radius: 0;display: block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #fff !important;border: 3px solid #fff;font-family: Montserrat, DejaVu Sans, Verdana, sans-serif;">&#161;NO COMPARTAS ESTE ENLACE CON NADIE!<br>&#161;ESTA INVITACI&#211;N SOLO SE PUEDE UTILIZAR UNA VEZ!</div><![endif]>
    <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:rect xmlns:v="urn:schemas-microsoft-com:vml" style="width:558px" filled="f" strokecolor="#FFFFFF" strokeweight="3px"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,12px,0px,12px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:Montserrat,DejaVu Sans,Verdana,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">&#161;NO COMPARTAS ESTE ENLACE CON NADIE!<br>&#161;ESTA INVITACI&#211;N SOLO SE PUEDE UTILIZAR UNA VEZ!</center></v:textbox></v:rect><![endif]--></div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div class="divider" style="display: block;font-size: 2px;line-height: 2px;Margin-left: auto;Margin-right: auto;width: 40px;background-color: #BBBBBB;Margin-bottom: 20px;">&nbsp;</div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
      <p style="Margin-top: 0;Margin-bottom: 20px;font-family: montserrat,dejavu sans,verdana,sans-serif;color:#FFFFFF"><span class="font-montserrat">Si el bot&#243;n no funciona, te sugerimos que pruebes copiar el siguiente enlace y pegarlo en tu navegador:</span></p>
    </div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
      <p style="Margin-top: 0;Margin-bottom: 20px;font-family: montserrat,dejavu sans,verdana,sans-serif;text-align: center;"><span class="font-montserrat"><a style="font-weight: bold; text-decoration: underline;transition: opacity 0.1s ease-in;color: #f30808;" href="https://discord.gg/${inviteCode}">https://discord.gg/${inviteCode}</a></span></p>
    </div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
      <p style="Margin-top: 0;Margin-bottom: 0;font-family: montserrat,dejavu sans,verdana,sans-serif;text-align: left; color:#FFFFFF;"><span class="font-montserrat">En el caso de que se te pida un c&#243;digo deber&#225;s ingresar el siguiente n&#250;mero:</span></p><p class="size-30" style="Margin-top: 20px;Margin-bottom: 20px;font-family: montserrat,dejavu sans,verdana,sans-serif;font-size: 26px;line-height: 34px;text-align: center;" lang="x-size-30"><span class="font-montserrat"><strong><span style="color:#f30808">${inviteCode}</span></strong></span></p>
    </div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 12px;">
    <div class="divider" style="display: block;font-size: 2px;line-height: 2px;Margin-left: auto;Margin-right: auto;width: 40px;background-color: #BBBBBB;">&nbsp;</div>
  </div>
      
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div>

    <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>

    <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: transparent;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #fff;font-size: 16px;line-height: 24px;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;">
      
          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 12px;">
    <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
      <p class="size-14" style="Margin-top: 0;Margin-bottom: 20px;font-family: montserrat,dejavu sans,verdana,sans-serif;font-size: 14px;line-height: 21px;" lang="x-size-14"><span class="font-montserrat"><span style="color:#BBBBBB">Para cualquier problema o duda pod&#233;s responder este mail y nos pondremos en contacto a la brevedad. Tambi&#233;n podr&#225;s encontrarnos en </span><span style="color:#f30808"><strong><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #f30808;" href="https://www.instagram.com/mars.argentina/">Instagram</a></strong></span><span style="color:#BBBBBB">&nbsp;o </span><span style="color:#f30808"><strong><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #f30808;" 
href="https://www.facebook.com/mars.argentina">Facebook</a>&nbsp;</strong></span><span style="color:#BBBBBB">y escribirnos por esos&nbsp;medios.</span></span></p>
    </div>
  </div>
      
      <div style="font-size: 12px;font-style: normal;font-weight: normal;line-height: 19px;" align="center">
        <a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #ee283f;" href="http://argentina.marssociety.org/"><img style="border: 0;display: block;height: auto;width: 100%;max-width: 306px;" alt="The Mars Society Argentina" width="306" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601224325/Untitled-99079e000003cf3c_tjka13.png"></a>
      </div>
          
                    <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
  </div>

     </div>
    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
   </div>
  </div>
    
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #FFFFFF;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #FFFFFF;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #fff;font-size: 16px;line-height: 24px;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif; background-color:#FFFFFF;">
      <div style="font-size: 12px;font-style: normal;font-weight: normal;line-height: 19px;Margin-top: 20px; background-color:#FFFFFF;" align="center">
        <img class="gnd-corner-image gnd-corner-image-center gnd-corner-image-bottom" style="border: 0;display: block;height: auto;width: 100%;max-width: 900px;" width="600" alt="Evento patrocinado por: INVAP, CONAE, Facultad de Ciencias Exactas, F&#237;sicas y Naturales, de San Juan, OAFA - Observatorio Astron&#243;mico F&#233;lix Aguilar, CASLEO - CONICET, Hotel Boutique Galileo Galilei, i3D, ESCAAD - Escuela Superior de Animaci&#243;n y Artes Digitales, Flight Edge, y 3DMazz" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601656700/sponsors_xnsiel.png">
      </div>
    
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div>

    <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>

    <div role="contentinfo">
      <div class="layout email-footer stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
        <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->
          <div class="column wide" style="text-align: left;font-size: 12px;line-height: 19px;color: #fff;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;Float: left;max-width: 400px;min-width: 320px; width: 320px;width: calc(8000% - 47600px);">
            <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
              <table class="email-footer__links" style="border-collapse: collapse;table-layout: fixed;" role="presentation" emb-web-links><tbody><tr role="navigation">
              <td style="padding: 0;width: 26px;" emb-web-links><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #fff;" href="https://www.facebook.com/mars.argentina"><img style="border: 0;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601247852/facebook_vflyrb.png" width="26" height="26" alt="Facebook"></a></td><td style="padding: 0 0 0 3px;width: 26px;" emb-web-links><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #fff;" href="https://twitter.com/mars_argentina"><img style="border: 0;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601247844/twitter_z8qneq.png" width="26" height="26" alt="Twitter"></a></td><td style="padding: 0 0 0 3px;width: 26px;" 
emb-web-links><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #fff;" href="https://www.youtube.com/channel/UCbtjX1aW83QLjyw2BPtxvyg"><img style="border: 0;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601247766/youtube_epliuw.png" width="26" height="26" alt="YouTube"></a></td><td style="padding: 0 0 0 3px;width: 26px;" emb-web-links><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #fff;" href="https://instagram.com/mars.argentina"><img style="border: 0;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601247762/instagram_zxsdai.png" width="26" height="26" alt="Instagram"></a></td><td style="padding: 0 0 0 3px;width: 26px;" emb-web-links><a style="text-decoration: 
underline;transition: opacity 0.1s ease-in;color: #fff;" href="http://argentina.marssociety.org/"><img style="border: 0;" src="https://res.cloudinary.com/the-mars-society-argentina/image/upload/v1601247848/website_ruysq9.png" width="26" height="26" alt="Website"></a></td>
              </tr></tbody></table>
              <div style="font-size: 12px;line-height: 19px;Margin-top: 20px;">
                
              </div>
              <div style="color:#BBBBBB; font-size: 12px;line-height: 19px;Margin-top: 18px;">
                <div>${whyHtml}</div>
              </div>
              <!--[if mso]>&nbsp;<![endif]-->
            </div>
          </div>
        <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->
          <div class="column narrow" style="text-align: left;font-size: 12px;line-height: 19px;color: #fff;font-family: Montserrat,DejaVu Sans,Verdana,sans-serif;Float: left;max-width: 320px;min-width: 200px; width: 320px;width: calc(72200px - 12000%);">
            <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
              
            </div>
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    <div style="line-height:16px;font-size:10px;">&nbsp;</div>
  </div></td></tr></tbody></table>
</body></html>`;
};

const transport = nodemailer.createTransport({
  host: credentials.emailHost,
  port: 587,
  auth: {
    user: credentials.authEmail,
    pass: credentials.authPassword,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * @param {string} mail
 * @param {import("./model").Role} role
 * @param {import("./model").Location} location
 * @param {string} inviteCode
 * @return {Promise<[boolean, string]>}
 */

module.exports = async (mail, role, location, inviteCode) => {
  return [true, "success"]
}


const oldInvite = async (mail, role, location, inviteCode) => {
  /** @type {Record<TextKeys, string>} */
  // @ts-ignore
  const textOpts = Object.fromEntries(
    Object.entries(text[role]).map(([name, func]) => [name, func(location)])
  )

  const opts = {inviteCode, ...textOpts}

  const sent = await transport.sendMail({
    from: `Space Apps Challenge - TMSA <${credentials.senderEmail}>`,
    to: mail,
    subject: "Invitación al Discord del SpaceApps Challenge",
    text: mailText(opts), // plain text body
    html: mailHTML(opts), // html body
  });

  if (sent.accepted.length === 1) {
    return [true, "success"];
  } else {
    throw [false, sent.response];
  }
};
