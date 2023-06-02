from setuptools import setup

setup(
    name='package',
    version='0.1.0',
    py_modules=['release'],
    install_requires=[
        'Click',
    ],
    entry_points={
        'console_scripts': [
            'package = release:package',
            'ship = release:ship'
        ],
    },
)