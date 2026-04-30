/**
 * Generates the release keystore and android/keystore.properties
 * Run ONCE before your first release build:
 *   node scripts/create-keystore.cjs
 *
 * Prerequisites: Java JDK must be installed (keytool is included with JDK).
 * The .jks file and keystore.properties are gitignored — keep them safe.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log('\n🔑  TinnitOff Release Keystore Generator\n');

  const keystorePath = path.join(__dirname, '../android/tinnitoff-release.jks');
  const propsPath   = path.join(__dirname, '../android/keystore.properties');

  if (fs.existsSync(keystorePath)) {
    console.log('✓ Keystore ya existe en android/tinnitoff-release.jks');
    rl.close();
    return;
  }

  const storePass = await ask('Contraseña del keystore (mín 6 chars): ');
  const keyPass   = await ask('Contraseña de la clave (mín 6 chars): ');
  const name      = await ask('Tu nombre completo: ');
  const org       = await ask('Organización (ej: TinnitOff): ');
  const country   = await ask('Código de país (ej: MX): ');
  rl.close();

  const dname = `CN=${name}, O=${org}, C=${country}`;
  const cmd = [
    'keytool -genkeypair',
    '-v',
    '-keystore', `"${keystorePath}"`,
    '-alias tinnitoff-key',
    '-keyalg RSA',
    '-keysize 2048',
    '-validity 10000',
    `-storepass "${storePass}"`,
    `-keypass "${keyPass}"`,
    `-dname "${dname}"`,
  ].join(' ');

  console.log('\nGenerando keystore...');
  execSync(cmd, { stdio: 'inherit' });

  const props = [
    `TINNITOFF_KEYSTORE=${keystorePath.replace(/\\/g, '/')}`,
    `TINNITOFF_KEYSTORE_PASSWORD=${storePass}`,
    `TINNITOFF_KEY_ALIAS=tinnitoff-key`,
    `TINNITOFF_KEY_PASSWORD=${keyPass}`,
  ].join('\n');

  fs.writeFileSync(propsPath, props + '\n');
  console.log('\n✓ android/keystore.properties creado');
  console.log('\n⚠️  IMPORTANTE: Haz backup de tinnitoff-release.jks en un lugar seguro.');
  console.log('   Si lo pierdes, no podrás actualizar la app en Play Store.\n');
}

main().catch(console.error);
