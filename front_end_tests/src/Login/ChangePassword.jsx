import React, { useState } from 'react';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Validación de la nueva contraseña: mínimo 8 caracteres, una mayúscula y un número
  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oldPassword) {
      newErrors.old_password = ['La contraseña actual es obligatoria'];
    }

    if (!validatePassword(newPassword1)) {
      newErrors.new_password1 = [
        'La nueva contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un número',
      ];
    }

    if (newPassword1 !== newPassword2) {
      newErrors.non_field_errors = ['Las nuevas contraseñas no coinciden'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const res = await fetch('https://manelgram112.pythonanywhere.com/dj-rest-auth/password/change/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // si usas autenticación por token o cookies, añade aquí la cabecera de autenticación si hace falta
        },
        credentials: 'include', // para enviar cookies si usas sesión
        body: JSON.stringify({
          old_password: oldPassword,
          new_password1: newPassword1,
          new_password2: newPassword2,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setOldPassword('');
        setNewPassword1('');
        setNewPassword2('');
      } else {
        setErrors(data);
      }
    } catch {
      setErrors({ non_field_errors: ['Error de conexión'] });
    }
  };

  const renderFieldErrors = (field) => {
    if (errors[field]) {
      return errors[field].map((msg, i) => (
        <p key={i} className="text-red-600 text-sm mt-1">
          {msg}
        </p>
      ));
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {!success ? (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-6">
                Cambiar contraseña
              </h2>

              <div>
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                />
                {renderFieldErrors('old_password')}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword1}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  required
                  minLength={8}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                />
                {renderFieldErrors('new_password1')}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  required
                  minLength={8}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                />
                {renderFieldErrors('new_password2')}
              </div>

              {renderFieldErrors('non_field_errors')}

              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cambiar contraseña
              </button>
            </form>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-green-600">
                Contraseña cambiada con éxito
              </h2>
              <p className="mt-2 text-gray-600">Ya puedes usar tu nueva contraseña.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ChangePassword;
