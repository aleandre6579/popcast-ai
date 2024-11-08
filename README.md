# PopcastAI
An AI-powered app that lets you upload any song to be analyzed and rated by an AI trained on the most popular songs of today.

<br/>

### File Structure

```
frontend
backend
scripts
notebooks
└── data
└── models
```

<br/>

### Using Notebooks

Run the following command to install all dependencies:
```
pip install -r requirements.txt
```

Essentia requires a Numpy version below v2.0. <br/>
Run this command to replace Numpy with an approparite version:

```
pip install numpy==1.26.4
```

In order to run essentia models with GPU, create an Anaconda environment:
```
conda create -n ess python=3.10
conda activate ess
```
And install necessary dependencies:
```
conda install -c conda-forge -y cudatoolkit=11.2 cudnn=8.1
```

<br/>

### Using Frontend
Run the following command to install all dependencies:
```
pnpm i
```

Run the following command to start the development server:
```
pnpm run dev
```
